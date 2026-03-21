import { Request, Response } from "express"
import * as Sentry from "@sentry/node"
import { prisma } from "../configs/prisma.js";

const PLAN_CREDITS = {
    free: 20,
    pro: 80,
    premium: 240,
} as const;

const getSingleParam = (value: string | string[] | undefined) => {
    return Array.isArray(value) ? value[0] : value;
}

const getStringClaim = (claims: Record<string, unknown> | null | undefined, keys: string[]) => {
    for (const key of keys) {
        const value = claims?.[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return "";
}

const buildUserProfileFromClaims = (claims: Record<string, unknown> | null | undefined) => {
    const firstName = getStringClaim(claims, ["first_name", "given_name"]);
    const lastName = getStringClaim(claims, ["last_name", "family_name"]);
    const fullName = getStringClaim(claims, ["name", "full_name"]);
    const email = getStringClaim(claims, ["email", "email_address", "primary_email_address"]);
    const name = fullName || `${firstName} ${lastName}`.trim() || getStringClaim(claims, ["username"]);
    const image = getStringClaim(claims, ["image_url", "picture", "avatar_url"]);

    return { email, name, image };
}


// Get User Credits
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        
        const auth = req.auth() as ReturnType<Request["auth"]> & {
            sessionClaims?: Record<string, unknown> | null;
        };
        const {userId, has, sessionClaims} = auth;
        if(!userId) {return res.status(401).json({message: 'Unauthorized'})}

        const plan = has({ plan: 'premium' })
            ? 'premium'
            : has({ plan: 'pro' })
                ? 'pro'
                : 'free';

        let user = await prisma.user.findUnique({where :{id: userId}})
        const claimProfile = buildUserProfileFromClaims(
            sessionClaims && typeof sessionClaims === "object" ? sessionClaims as Record<string, unknown> : null
        );

        if (!user) {
            const profile = {
                email: claimProfile.email || `${userId}@clerk.local`,
                name: claimProfile.name || "Clerk User",
                image: claimProfile.image
            };

            user = await prisma.user.upsert({
                where: { id: userId },
                update: {
                    email: profile.email,
                    name: profile.name,
                    image: profile.image,
                    credits: PLAN_CREDITS[plan]
                },
                create: {
                    id: userId,
                    email: profile.email,
                    name: profile.name,
                    image: profile.image,
                    credits: PLAN_CREDITS[plan]
                }
            });
        }

        const nextProfile = {
            email: claimProfile.email || user.email,
            name: claimProfile.name || user.name,
            image: claimProfile.image || user.image
        };

        if (user.email !== nextProfile.email || user.name !== nextProfile.name || user.image !== nextProfile.image) {
            user = await prisma.user.update({
                where: { id: userId },
                data: {
                    email: nextProfile.email,
                    name: nextProfile.name,
                    image: nextProfile.image
                }
            })
        }

        res.json({credits: user.credits, plan})

    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({message: error.code || error.message})
    }
}

// get all user projects
export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const {userId} = req.auth();
        const projects = await prisma.project.findMany({where: {userId}, orderBy: {createdAt: 'desc'}})
        res.json({projects})
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({message: error.code || error.message})
    }
}

//get project by Id
export const getProjectById = async (req: Request, res: Response) => {
    try {
        
        const {userId} = req.auth();
        const projectId = getSingleParam(req.params.projectId);

        if (!projectId) {
            return res.status(400).json({message: 'Project id is required'})
        }

        const project = await prisma.project.findUnique({ where:{ id: projectId, userId}})
        if (!project) { return res.status(404).json({message: 'Project not found'})}
        
        res.json({project})

    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({message: error.code || error.message})
    }
}

//publish / unpublish project
export const toggleProjectById = async (req: Request, res: Response) => {
    try {

        const {userId} = req.auth();
        const projectId = getSingleParam(req.params.projectId);

        if (!projectId) {
            return res.status(400).json({message: 'Project id is required'})
        }

        const project = await prisma.project.findUnique({ where:{ id: projectId, userId}})
        if (!project) { return res.status(404).json({message: 'Project not found'})}

        if (!project?.generatedImage && !project?.generatedVideo) {
            return res.status(404).json({message: 'image or video not generated'})
        }
        
        await prisma.project.update({
            where: {id: projectId},
            data: {isPublished: !project.isPublished}
        })
        res.json({isPublished: !project.isPublished})

        
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({message: error.code || error.message})
    }
}
