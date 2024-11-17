import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { postId, action } = req.body;

    console.log("Vote Request Body:", req.body);

    if (!postId || !["UPVOTE", "DOWNVOTE"].includes(action)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    try {
      // Get session
      const session = await getServerSession(req, res, authOptions);

      // Ensure session exists
      if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized: No session found" });
      }

      const userId = session.user.id;
      console.log("Logged-in User ID:", userId);

      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (action === "UPVOTE") {
        // Check if the upvote already exists
        const existingUpvote = await prisma.upvote.findUnique({
          where: {
            post_id_user_id: { post_id: postId, user_id: userId },
          },
        });

        if (existingUpvote) {
          console.log("Upvote already exists. Removing the upvote...");
          // Remove the upvote
          await prisma.upvote.delete({
            where: { id: existingUpvote.id },
          });
          // Decrement the counter
          await prisma.post.update({
            where: { id: postId },
            data: { counter: { decrement: 1 } },
          });
        } else {
          console.log("Upvote does not exist. Adding the upvote...");
          // Add a new upvote
          await prisma.upvote.create({
            data: { post_id: postId, user_id: userId },
          });
          // Increment the counter
          await prisma.post.update({
            where: { id: postId },
            data: { counter: { increment: 1 } },
          });
        }
      } else if (action === "DOWNVOTE") {
        // Check if the downvote already exists
        const existingDownvote = await prisma.downvote.findUnique({
          where: {
            post_id_user_id: { post_id: postId, user_id: userId },
          },
        });

        if (existingDownvote) {
          console.log("Downvote already exists. Removing the downvote...");
          // Remove the downvote
          await prisma.downvote.delete({
            where: { id: existingDownvote.id },
          });
          // Increment the counter
          await prisma.post.update({
            where: { id: postId },
            data: { counter: { increment: 1 } },
          });
        } else {
          console.log("Downvote does not exist. Adding the downvote...");
          // Add a new downvote
          await prisma.downvote.create({
            data: { post_id: postId, user_id: userId },
          });
          // Decrement the counter
          await prisma.post.update({
            where: { id: postId },
            data: { counter: { decrement: 1 } },
          });
        }
      }

      const updatedPost = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: {
              username: true,
              profile: { select: { profile_img: true, name: true } },
            },
          },
          comments: true,
        },
      });

      res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error in vote operation:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
