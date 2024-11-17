import { getServerSession } from "next-auth";
import prisma from "../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Get the logged-in user's session
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { postId } = req.body;

      if (!postId) {
        return res.status(400).json({ message: "Post ID is required" });
      }

      // Fetch the post from the database
      const post = await prisma.post.findUnique({
        where: { id: parseInt(postId, 10) },
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if the logged-in user is the owner of the post
      const isOwner = post.user_id === session.user.id;

      return res.status(200).json({ isOwner });
    } catch (error) {
      console.error("Error verifying post ownership:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
