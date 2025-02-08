import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.error("[ERROR] Invalid method. Only POST allowed.");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { postId, commentText } = req.body;

  if (!postId || !commentText.trim()) {
    console.error("[ERROR] Missing postId or commentText.");
    return res
      .status(400)
      .json({ error: "Post ID and comment text are required" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      console.error("[ERROR] Unauthorized access. No session or user found.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;

    const newComment = await prisma.comment.create({
      data: {
        post_id: parseInt(postId),
        user_id: userId,
        comment_text: commentText.trim(),
        edited: false, // Newly created comments should have `edited` set to false
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

    // Construct full profile image URL if the user has one
    const profileImageUrl = newComment.user?.profile?.profile_img
      ? `/uploads/${newComment.user.profile.profile_img}` // Adjust to your upload path
      : "/images/default-avatar.png"; // Default image

    const responseComment = {
      id: newComment.id,
      text: newComment.comment_text,
      user: {
        username: newComment.user?.username || "Anonymous",
        profile_img: profileImageUrl,
      },
      timestamp: newComment.created_at,
      edited: newComment.edited, // Include the edited field in the response
    };

    return res.status(201).json(responseComment);
  } catch (error) {
    console.error("[ERROR] Error adding comment:", error);

    // Enhance error handling for Prisma errors
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
