// pages/api/admin/manage-community.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { communityId, action } = req.body;

  if (!communityId || !action) {
    return res.status(400).json({ error: "communityId and action are required" });
  }

  if (!["APPROVE", "REJECT"].includes(action.toUpperCase())) {
    return res.status(400).json({ error: "Invalid action. Use 'APPROVE' or 'REJECT'." });
  }

  try {
    // Fetch community details before updating
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { ownerId: true, name: true },
    });

    if (!community || !community.name) {
      return res.status(404).json({ error: "Community not found or has no name" });
    }

    // Update community status
    const updatedCommunity = await prisma.community.update({
      where: { id: communityId },
      data: { status: action.toUpperCase() },
    });

    if (action.toUpperCase() === "APPROVE") {
      await prisma.notification.create({
        data: {
          userId: community.ownerId,
          actionUserId: session.user.id, // Track which admin approved it
          message: `Your community "${community.name}" has been approved by the admin.`,
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
