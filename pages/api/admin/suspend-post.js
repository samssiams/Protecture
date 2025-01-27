import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log("API called with method:", req.method); // Log API method

  if (req.method === "POST") {
    const { postId } = req.body;

    console.log("Received postId:", postId); // Debugging log

    if (!postId) {
      console.error("Post ID is missing or invalid."); // Debugging log
      return res.status(400).json({ error: "Post ID is required" });
    }

    try {
      console.log("Attempting to update post status in the database..."); // Debugging log
      const post = await prisma.post.update({
        where: { id: postId },
        data: { status: "REPORTED" },
      });

      console.log("Post updated successfully:", post); // Log success
      return res.status(200).json({ message: "Post suspended successfully", post });
    } catch (error) {
      console.error("Error updating post status:", error); // Log detailed error
      return res.status(500).json({
        error: "Failed to suspend post",
        details: error.message, // Include detailed error
      });
    }
  } else {
    console.error("Invalid request method:", req.method); // Log invalid method
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
