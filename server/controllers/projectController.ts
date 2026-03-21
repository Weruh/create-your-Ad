import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import fs from "fs";
import { prisma } from "../configs/prisma.js";
import fal from "../configs/fal.js";
import { v2 as cloudinary } from "cloudinary";

type FalFile = {
    url?: string;
};

type FalImageResponse = {
    images?: FalFile[];
};

type FalVideoResponse = {
    video?: FalFile;
};

const DEFAULT_VIDEO_DURATION_SECONDS = 15;

const getErrorMessage = (error: unknown) => {
    return error instanceof Error ? error.message : "Unknown error";
};

const getSingleParam = (value: string | string[] | undefined) => {
    return Array.isArray(value) ? value[0] : value;
};

const getFalImageSize = (aspectRatio?: string) => {
    switch (aspectRatio) {
        case "16:9":
            return { width: 1280, height: 720 };
        case "1:1":
            return { width: 1024, height: 1024 };
        case "9:16":
        default:
            return { width: 720, height: 1280 };
    }
};

const getFalVideoDuration = () => {
    return String(DEFAULT_VIDEO_DURATION_SECONDS);
};

const ensureFalConfigured = () => {
    if (!process.env.FAL_KEY) {
        throw new Error("FAL_KEY is not configured");
    }
};

const removeUploadedFiles = async (files: Express.Multer.File[]) => {
    await Promise.all(
        files.map(async (file) => {
            if (!file.path) {
                return;
            }

            try {
                await fs.promises.unlink(file.path);
            } catch {
                // Ignore temp-file cleanup failures.
            }
        })
    );
};

const buildImagePrompt = (userPrompt?: string) => {
    return [
        "Use image 1 as the product reference and image 2 as the person/model reference.",
        "Create a realistic ecommerce advertisement photo.",
        "The person from image 2 should naturally hold, wear, or use the exact product from image 1.",
        "Preserve the product design, branding, proportions, and important visual details from image 1.",
        "Preserve the person identity and facial features from image 2.",
        "Match lighting, shadows, scale, and perspective so the final scene looks like a real professional studio shoot.",
        "Produce photorealistic, premium marketing imagery.",
        userPrompt?.trim() || "",
    ]
        .filter(Boolean)
        .join(" ");
};

const buildVideoPrompt = (productName: string, productDescription: string, userPrompt: string) => {
    return [
        `Create a short cinematic product showcase video for ${productName}.`,
        productDescription ? `Product description: ${productDescription}.` : "",
        "Animate the subject naturally from the first frame while keeping the product design consistent.",
        "Focus on subtle camera movement, believable motion, premium ad styling, and photorealistic detail.",
        "Do not add text overlays, subtitles, watermarks, or UI elements.",
        userPrompt?.trim() || "",
    ]
        .filter(Boolean)
        .join(" ");
};


export const createProject = async( req:Request, res:Response) =>{
    let tempProjectId: string | undefined;
    let isCreditDeducted = false;
    let images: Express.Multer.File[] = [];
    const { userId } = req.auth();

    try {
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        ensureFalConfigured();

        const {name = 'New Project', aspectRatio, userPrompt, productName, productDescription, targetLength = DEFAULT_VIDEO_DURATION_SECONDS } = req.body;

        images = (req.files as Express.Multer.File[] | undefined) ?? [];

        if (images.length < 2 || !productName) {
            return res.status(400).json({message: 'Please upload at least 2 images'})
        }

        const user = await prisma.user.findUnique({where: {id: userId}})

        if (!user || user.credits < 5) {
            return res.status(401).json({message: 'Insufficient credits'})
        }else{
            // deduct dredits for image generation
            await prisma.user.update({
                where: {id: userId},
                data: {credits: {decrement: 5}}
            }).then(()=>{isCreditDeducted = true})
        }
       
        const uploadedImages = await Promise.all(
            images.map(async(item: any)=>{
                const result = await cloudinary.uploader.upload(item.path,
                    {resource_type: 'image'});
                    return result.secure_url
                
            })
        )

        const project = await prisma.project.create({
            data: {
                name,
                userId,
                productName,
                productDescription,
                userPrompt,
                aspectRatio,
                targetLength: Number.parseInt(String(targetLength), 10) || DEFAULT_VIDEO_DURATION_SECONDS,
                uploadedImages,
                isGenerating:true
            }
        })

        tempProjectId = project.id;

        const result = await fal.subscribe("wan/v2.6/image-to-image", {
            input: {
                prompt: buildImagePrompt(userPrompt),
                image_urls: uploadedImages.slice(0, 2),
                image_size: getFalImageSize(aspectRatio),
                num_images: 1,
                enable_prompt_expansion: true,
                enable_safety_checker: true,
            },
            timeout: 3 * 60 * 1000,
        });

        const generatedImageUrl = (result.data as FalImageResponse)?.images?.[0]?.url;

        if (!generatedImageUrl) {
            throw new Error("Failed to generate image");
        }

        const uploadResult = await cloudinary.uploader.upload(generatedImageUrl, {
            resource_type: "image",
        });

        await prisma.project.update({
            where: {id: project.id},
            data:{
                generatedImage: uploadResult.secure_url,
                isGenerating: false
            }
        })

        res.json({ message: "Image generation completed", projectId: project.id })

    } catch (error:any) {
        const errorMessage = getErrorMessage(error);

        if (tempProjectId!) {
            // update project status and error message
            await prisma.project.update({
                where: {id: tempProjectId},
                data: {isGenerating: false, error: errorMessage}
            })
        }

        if (isCreditDeducted) {
            // add credits back
            await prisma.user.update({
                where: {id: userId},
                data: {credits: {increment: 5}}
            })
        }
        Sentry.captureException(error);
        res.status(500).json({ message: errorMessage})
    } finally {
        await removeUploadedFiles(images);
    }
}

export const createVideo = async( req:Request, res:Response) =>{
    const {userId} = req.auth()
    const { projectId } = req.body;
    let isCreditDeducted = false;


    try {
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        ensureFalConfigured();

        if (!projectId) {
            return res.status(400).json({ message: "Project id is required" });
        }

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        if (!user || user.credits < 10) {
            return res.status(401).json({ message: 'Insufficient credits'})
        }

        await prisma.user.update({
            where: {id: userId},
            data: {credits: {decrement: 10}}
        }).then(()=>{ isCreditDeducted = true})

        const project = await prisma.project.findUnique({
            where: {id: projectId, userId},
            include: {user: true}
        })
        
        if (!project || project.isGenerating) {
            return res.status(404).json({ message: 'Generation in progress'})
        }

        if (project.generatedVideo) {
            return res.status(404).json({ message: 'Video already generated'})
        }

        await prisma.project.update({
            where: {id: projectId},
            data: {isGenerating: true}
        })

        const prompt = `make the person showcase the product which is ${project.productName} ${project.productDescription  &&  `and Product Description: ${project.productDescription}`}`

        if (!project.generatedImage) {
            throw new Error("Generated image not found");
        }

        const result = await fal.subscribe("wan/v2.6/image-to-video", {
            input: {
                prompt: buildVideoPrompt(
                    project.productName,
                    project.productDescription,
                    project.userPrompt
                ),
                image_url: project.generatedImage,
                duration: getFalVideoDuration(),
                resolution: "720p",
                enable_prompt_expansion: true,
                enable_safety_checker: true,
            },
            timeout: 15 * 60 * 1000,
        });

        const generatedVideoUrl = (result.data as FalVideoResponse)?.video?.url;

        if (!generatedVideoUrl) {
            throw new Error("Failed to generate video");
        }

        const uploadResult = await cloudinary.uploader.upload(generatedVideoUrl, {
            resource_type: "video",
        });

        await prisma.project.update({
            where: {id: projectId},
            data:{
                generatedVideo: uploadResult.secure_url,
                isGenerating: false
            }
        })

        res.json({ message: 'Video generation completed', videoUrl: uploadResult.secure_url})



    } catch (error:any) {
        const errorMessage = getErrorMessage(error);

        await prisma.project.update({
            where: {id: projectId, userId},
            data: {isGenerating: false, error: errorMessage}
        })

        if (isCreditDeducted) {
            // add credits back
            await prisma.user.update({
                where: {id: userId},
                data: {credits: {increment: 10}}
            })
        }

        Sentry.captureException(error);
        res.status(500).json({ message: errorMessage})
    }
}

export const getAllPublishedProjects = async( req:Request, res:Response) =>{
    try {
          
        const projects = await prisma.project.findMany({ where: {isPublished: true}})
        res.json({projects})

    } catch (error:any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.message})
    }
}

export const deleteProject = async( req:Request, res:Response) =>{
    try {

        const { userId } = req.auth();
        const projectId = getSingleParam(req.params.projectId);

        if (!projectId) {
            return res.status(400).json({ message: 'Project id is required'})
        }

        const project = await prisma.project.findUnique({ where: {id: projectId, userId}})

        if (!project) {
            return res.status(404).json({ message: 'Project not found'})
        }

        await prisma.project.delete({
            where: {id: projectId }
        })

        res.json({ message: 'Project deleted successfully' })
        
    } catch (error:any) {
        const errorMessage = getErrorMessage(error);
        Sentry.captureException(error);
        res.status(500).json({ message: errorMessage})
    }
}
