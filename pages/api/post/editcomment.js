import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { commentId, commentText } = req.body;

  if (!commentId || !commentText.trim()) {
    return res
      .status(400)
      .json({ error: "Comment ID and text are required" });
  }

  try {
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { comment_text: commentText.trim(), edited: true },
    });

    return res.status(200).json({
      id: updatedComment.id,
      text: updatedComment.comment_text,
      timestamp: updatedComment.created_at,
      edited: updatedComment.edited,
    });
  } catch (error) {
    console.error("Error editing comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}