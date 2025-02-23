import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";


export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { commentId } = req.body;

  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
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

    await prisma.comment.delete({
      where: { id: parseInt(commentId, 10) },
    });

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
