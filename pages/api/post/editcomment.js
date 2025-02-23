import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";


export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { commentId, commentText } = req.body;

  if (!commentId || !commentText.trim()) {
    return res.status(400).json({ error: "Comment ID and text are required" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const currentUserId = session.user.id;

    // Verify that the current user is the owner of the comment.
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId, 10) },
    });

    if (!existingComment || existingComment.user_id !== currentUserId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId, 10) },
      data: { comment_text: commentText.trim(), edited: true },
    });

    // Return the updated comment with both the edited and isCurrentUser flags.
    return res.status(200).json({
      id: updatedComment.id,
      text: updatedComment.comment_text,
      timestamp: updatedComment.created_at,
      edited: updatedComment.edited, // true indicates the comment was edited
      isCurrentUser: true,            // Ensures the UI shows edit/delete buttons for the owner
    });
  } catch (error) {
    console.error("Error editing comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
