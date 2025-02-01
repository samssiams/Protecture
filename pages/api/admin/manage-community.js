// pages/api/admin/manage-community.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { communityId, action } = req.body;

  if (!communityId || !action) {
    return res.status(400).json({ error: "communityId and action are required" });
  }

  if (!["APPROVE", "REJECT"].includes(action.toUpperCase())) {
    return res.status(400).json({ error: "Invalid action. Use 'APPROVE' or 'REJECT'." });
  }

  try {
    // Update the community status
    const updatedCommunity = await prisma.community.update({
      where: { id: communityId },
      data: { status: action.toUpperCase() },
    });

    // Fetch the community owner
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { ownerId: true },
    });

    if (action.toUpperCase() === "APPROVE") {
      // Create a notification for the owner
      await prisma.notification.create({
        data: {
          userId: community.ownerId,
          message: `Your community "hatdog" has been approved by the admin.`,
          type: "COMMUNITY_APPROVAL",
          isRead: false,
        },
      });
    }

    res.status(200).json({
      message: `Community ${action.toLowerCase()}d successfully.`,
      community: updatedCommunity,
    });
  } catch (error) {
    console.error("Error managing community:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
