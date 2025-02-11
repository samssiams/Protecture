// /api/post/archive.js
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { postId, action } = req.body;
    if (!postId || !action) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    let updatedPost;
    if (action === "archive") {
      updatedPost = await prisma.post.update({
        where: { id: Number(postId) },
        data: { archived: true },
      });
    } else if (action === "unarchive") {
      updatedPost = await prisma.post.update({
        where: { id: Number(postId) },
        data: { archived: false },
      });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating post archive status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
