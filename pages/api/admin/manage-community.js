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

  const act = action.toUpperCase();
  if (!["APPROVE", "REJECT", "ARCHIVE"].includes(act)) {
    return res.status(400).json({ error: "Invalid action. Use 'APPROVE', 'REJECT', or 'ARCHIVE'." });
  }

  try {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { ownerId: true, name: true },
    });
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    let updatedCommunity;
    if (act === "ARCHIVE") {
      updatedCommunity = await prisma.community.update({
        where: { id: communityId },
        data: { status: "INACTIVE" },
      });
    } else {
      updatedCommunity = await prisma.community.update({
        where: { id: communityId },
        data: { status: act },
      });
      if (act === "APPROVE") {
        await prisma.notification.create({
          data: {
            userId: community.ownerId,
            actionUserId: session.user.id,
            message: `Your community "${community.name}" has been approved by the admin.`,
            type: "COMMUNITY_APPROVAL",
            isRead: false,
          },
        });
      }
    }

    res.status(200).json({
      message: `Community ${act.toLowerCase()}d successfully.`,
      community: updatedCommunity,
    });
  } catch (error) {
    console.error("Error managing community:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
