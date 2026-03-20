import { Request, Response } from "express"
import * as Sentry from "@sentry/node"
import { clerkClient } from "@clerk/express";
import { prisma } from "../configs/prisma.js";

const PLAN_CREDITS = {
    free: 20,
    pro: 80,
    premium: 240,
} as const;

const getSingleParam = (value: string | string[] | undefined) => {
    return Array.isArray(value) ? value[0] : value;
}


// Get User Credits
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        
        const {userId, has} = req.auth();
        if(!userId) {return res.status(401).json({message: 'Unauthorized'})}

        const plan = has({ plan: 'premium' })
            ? 'premium'
            : has({ plan: 'pro' })
                ? 'pro'
                : 'free';

        const expectedCredits = PLAN_CREDITS[plan];

        let user = await prisma.user.findUnique({where :{id: userId}})

        if (!user) {
            const clerkUser = await clerkClient.users.getUser(userId);
            const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;

            if (!primaryEmail) {
                return res.status(400).json({message: 'User email not found'})
            }

            user = await prisma.user.upsert({
                where: { id: userId },
                update: {
                    email: primaryEmail,
                    name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || primaryEmail,
                    image: clerkUser.imageUrl,
                    credits: expectedCredits
                },
                create: {
                    id: userId,
                    email: primaryEmail,
                    name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || primaryEmail,
                    image: clerkUser.imageUrl,
                    credits: expectedCredits
                }
            });
        }

        if (user.credits !== expectedCredits) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: expectedCredits }
            })
        }

        res.json({credits: expectedCredits, plan})

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
