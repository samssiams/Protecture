import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const userId = session.user.id;

    // Update the post's `archived` field
    const updatedPost = await prisma.post.update({
      where: { id: postId, user_id: userId },
      data: { archived: true },
    });

    return res.status(200).json({ message: "Post archived successfully", post: updatedPost });
  } catch (error) {
    console.error("Error archiving post:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}