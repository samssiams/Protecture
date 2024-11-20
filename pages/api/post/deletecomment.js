import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { commentId } = req.body;

  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }

  try {
    await prisma.comment.delete({
      where: {
        id: parseInt(commentId),
      },
    });

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
