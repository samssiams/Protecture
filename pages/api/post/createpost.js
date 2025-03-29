import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = session.user.id;

      // Rate limiting: Allow maximum 3 posts per 5 minutes.
      const postLimitTimeWindow = 5 * 60 * 1000;
      const now = new Date();
      const recentPostsCount = await prisma.post.count({
        where: {
          user: { id: userId },
          created_at: {
            gte: new Date(now - postLimitTimeWindow),
          },
        },
      });
      if (recentPostsCount >= 3) {
        return res.status(429).json({
          message:
            "You have exceeded the post limit. Please wait for 5 minutes before posting again.",
        });
      }

      // Expecting JSON payload with description, category_id, optional image_url and optionally community_id.
      const { description, category_id, image_url, community_id } = req.body;
      if (!description || !category_id) {
        return res
          .status(400)
          .json({ message: "Description and category are required." });
      }

      // Create the new post
      const newPost = await prisma.post.create({
        data: {
          description,
          category_id,
          image_url: image_url || null, // Set to null if no image is provided.
          user: { connect: { id: userId } }, // Connect the post to the user.
        },
      });

      // If a community is specified, create the corresponding community post entry.
      if (community_id) {
        await prisma.communityPost.create({
          data: {
            postId: newPost.id,
            communityId: parseInt(community_id, 10),
          },
        });
      }

      // Create a notification for the post creation.
      await prisma.notification.create({
        data: {
          userId: userId,
          actionUserId: userId,
          type: "POST_CREATE",
          message: "You have successfully created a new post.",
        },
      });

      return res.status(201).json(newPost);
    } catch (error) {
      console.error("Error handling post creation:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
