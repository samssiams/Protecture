import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log("Handler invoked.");

  if (req.method !== "POST") {
    console.log("Invalid method. Only POST allowed.");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { postId, commentText } = req.body;
  console.log("Request body:", req.body);

  if (!postId || !commentText) {
    console.log("Missing postId or commentText.");
    return res.status(400).json({ error: "Post ID and comment text are required" });
  }

  try {
    console.log("Attempting to fetch session...");
    const session = await getServerSession(req, res, authOptions);
    console.log("Session fetched:", session);

    if (!session || !session.user) {
      console.log("Unauthorized access. No session or user found.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;
    console.log("User ID:", userId);

    console.log("Attempting to create a new comment...");
    const newComment = await prisma.comment.create({
      data: {
        post_id: postId,
        user_id: userId,
        comment_text: commentText,
      },
      include: {
        user: {
          select: {
            username: true,
            profile: {
              select: {
                profile_img: true,
              },
            },
          },
        },
      },
    });
    console.log("New comment created:", newComment);

    console.log("Returning success response...");
    return res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
