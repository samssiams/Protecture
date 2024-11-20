import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { postId, action } = req.body;

    if (!postId || !["UPVOTE", "DOWNVOTE"].includes(action)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    try {
      // Get session
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized: No session found" });
      }

      const userId = session.user.id;

      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { user: true }, // Include the post's owner
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const postOwnerId = post.user_id;

      if (action === "UPVOTE") {
        const existingUpvote = await prisma.upvote.findUnique({
          where: {
            post_id_user_id: { post_id: postId, user_id: userId },
          },
        });

        if (existingUpvote) {
          // Remove the upvote
          await prisma.upvote.delete({
            where: { id: existingUpvote.id },
          });
          await prisma.post.update({
            where: { id: postId },
            data: { counter: { decrement: 1 } },
          });
        } else {
          // Add a new upvote
          await prisma.upvote.create({
            data: { post_id: postId, user_id: userId },
          });
          await prisma.post.update({
            where: { id: postId },
            data: { counter: { increment: 1 } },
          });

          // Create notification for the post owner
          if (postOwnerId !== userId) {
            await prisma.notification.create({
              data: {
                userId: postOwnerId,
                actionUserId: userId,
                type: "UPVOTE",
                message: `${session.user.username} upvoted your post.`,
              },
            });
          }
        }
      } else if (action === "DOWNVOTE") {
        const existingDownvote = await prisma.downvote.findUnique({
          where: {
            post_id_user_id: { post_id: postId, user_id: userId },
          },
        });

        if (existingDownvote) {
          // Remove the downvote
          await prisma.downvote.delete({
            where: { id: existingDownvote.id },
          });
          await prisma.post.update({
            where: { id: postId },
            data: { counter: { increment: 1 } },
          });
        } else {
          // Add a new downvote
          await prisma.downvote.create({
            data: { post_id: postId, user_id: userId },
          });
          await prisma.post.update({
            where: { id: postId },
            data: { counter: { decrement: 1 } },
          });

          // Create notification for the post owner
          if (postOwnerId !== userId) {
            await prisma.notification.create({
              data: {
                userId: postOwnerId,
                actionUserId: userId,
                type: "DOWNVOTE",
                message: `${session.user.username} downvoted your post.`,
              },
            });
          }
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
