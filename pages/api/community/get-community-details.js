// pages/api/community/retrieve-community-details.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { communityId } = req.query;

    // Validate communityId
    if (!communityId) {
      return res.status(400).json({ message: "communityId is required." });
    }

    const parsedCommunityId = parseInt(communityId, 10);

    if (isNaN(parsedCommunityId)) {
      return res.status(400).json({ message: "Invalid communityId format." });
    }

    try {
      // Fetch the community from the database
      const community = await prisma.community.findUnique({
        where: { id: parsedCommunityId },
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
          communityPosts: true, // Include posts if needed
        },
      });

      if (community) {
        res.status(200).json(community);
      } else {
        res.status(404).json({ message: "Community not found." });
      }
    } catch (error) {
      console.error("Error retrieving community details:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}