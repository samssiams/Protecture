import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { communityId } = req.body;
    if (!communityId) {
      return res.status(400).json({ error: "Community id is required" });
    }

    const parsedCommunityId = parseInt(communityId, 10);
    if (isNaN(parsedCommunityId)) {
      return res.status(400).json({ error: "Invalid community id" });
    }

    // Retrieve community details (for notification)
    const community = await prisma.community.findUnique({
      where: { id: parsedCommunityId },
      select: { name: true },
    });
    const communityName = community?.name || "the community";

    // Check if the membership exists
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: parsedCommunityId, userId: user.id },
      },
    });
    if (!membership) {
      return res.status(200).json({ message: "You are not a member of this community" });
    }
    if (membership.status === "left") {
      return res.status(200).json({ message: "You have already left this community" });
    }

    // Update membership status to "left"
    await prisma.communityMember.update({
      where: {
        communityId_userId: { communityId: parsedCommunityId, userId: user.id },
      },
      data: { status: "left" },
    });

    // Create a notification upon successful leave
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "community_leave",
        message: `You have successfully left ${communityName}.`,
      },
    });

    return res.status(200).json({ message: "Left community successfully" });
  } catch (error) {
    console.error("Error leaving community:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
