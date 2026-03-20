import { Request, Response } from "express";
import { verifyWebhook } from '@clerk/express/webhooks';
import { prisma } from "../configs/prisma.js";
import * as Sentry from "@sentry/node"


const PLAN_CREDITS = {
    free: 20,
    pro: 80,
    premium: 240,
} as const;

const getClerkUserId = (data: any) => {
    return data?.payer?.user_id || data?.subscription?.payer?.user_id || data?.user_id;
}

const getPlanSlug = (data: any) => {
    return data?.subscription_items?.[0]?.plan?.slug
        || data?.subscription_item?.plan?.slug
        || data?.plan?.slug;
}

const syncUserCreditsFromPlan = async (data: any) => {
    const clerkUserId = getClerkUserId(data);
    const planSlug = getPlanSlug(data) as keyof typeof PLAN_CREDITS | undefined;

    if (!clerkUserId || !planSlug || !(planSlug in PLAN_CREDITS)) {
        return;
    }

    await prisma.user.updateMany({
        where: { id: clerkUserId },
        data: { credits: PLAN_CREDITS[planSlug] }
    });
}



const clerkWebhooks = async (req: Request, res: Response) => {
    try {
        const evt = await verifyWebhook(req);
        
        // Extract Data and Type from the event
        const { data, type } = evt as any; 

        // Switch cases for different webhook events
        switch (type) {
            case "user.created": {
                // Use create for new users
                await prisma.user.create({
                    data: {
                        id: data.id,
                        email: data?.email_addresses?.[0]?.email_address,
                        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
                        image: data?.image_url,
                    }
                });
                break;
            }

            case "user.updated": {
                // PROACTIVE FIX: Use upsert instead of update.
                // If the user doesn't exist yet, it will create them instead of crashing.
                await prisma.user.upsert({
                    where: { id: data.id },
                    update: {
                        email: data?.email_addresses?.[0]?.email_address,
                        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
                        image: data?.image_url,
                    },
                    create: {
                        id: data.id,
                        email: data?.email_addresses?.[0]?.email_address,
                        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
                        image: data?.image_url,
                    }
                });
                break;
            }

            case "user.deleted": { 
                if (data.id) {
                    // THE FIX: Use deleteMany instead of delete.
                    // This won't throw an error if the user is already deleted or never existed.
                    await prisma.user.deleteMany({ 
                        where: { id: data.id }
                    });
                }
                break;
            }

            case "paymentAttempt.updated": {
                if ((data?.type === "recurring" || data?.type === "checkout") && data?.status === "paid") {
                    await syncUserCreditsFromPlan(data);
                }
                break;
            }

            case "subscriptionItem.active":
            case "subscriptionItem.updated": {
                await syncUserCreditsFromPlan(data);
                break;
            }

            default:
                break;
        }

        // Return a 200 to tell Clerk the webhook was handled successfully
        return res.status(200).json({ message: "Webhook Received: " + type });

    } catch (error: any) {
        Sentry.captureException(error)
        console.error("Webhook processing error:", error.message);
        return res.status(500).json({ message: error.message });
    }
}

export default clerkWebhooks;
