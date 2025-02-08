// pages/api/post/[postId].js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required." });
    }

    try {
      const post = await prisma.post.findUnique({
        where: { id: parseInt(postId) },
        include: {
          comments: true, // Include comments related to the post
        },
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }

      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}