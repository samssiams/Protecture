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

    // Retrieve the community details for the notification
    const community = await prisma.community.findUnique({
      where: { id: parsedCommunityId },
      select: { name: true },
    });
    const communityName = community?.name || "the community";

    // Check for an existing membership
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: parsedCommunityId, userId: user.id },
      },
    });

    let responseMessage = "";
    if (membership) {
      if (membership.status === "left") {
        await prisma.communityMember.update({
          where: {
            communityId_userId: { communityId: parsedCommunityId, userId: user.id },
          },
          data: { status: "joined" },
        });
        responseMessage = "Joined community successfully";
      } else {
        return res.status(400).json({ error: "User already joined this community" });
      }
    } else {
      await prisma.communityMember.create({
        data: {
          communityId: parsedCommunityId,
          userId: user.id,
          status: "joined",
        },
      });
      responseMessage = "Joined community successfully";
    }

    // Create a notification upon successful join
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "community_join",
        message: `You have successfully joined ${communityName}.`,
      },
    });

    return res.status(200).json({ message: responseMessage });
  } catch (error) {
    console.error("Error joining community:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
