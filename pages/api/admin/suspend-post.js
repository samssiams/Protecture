// File: /pages/api/admin/suspend-post.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { postId, reportId } = req.body;

    if (!postId || !reportId) {
      console.error("Post ID or Report ID is missing or invalid."); // Debugging log
      return res.status(400).json({ error: "Post ID and Report ID are required" });
    }

    try {
      const post = await prisma.post.update({
        where: { id: postId },
        data: { status: "SUSPENDED" }, // Changed to "SUSPENDED" as per requirement
      });

      const report = await prisma.report.update({
        where: { id: reportId },
        data: { status: "FULFILLED" },
      });

      return res.status(200).json({ message: "Post and report suspended successfully", post, report });
    } catch (error) {
      console.error("Error updating post or report status:", error); // Log detailed error
      return res.status(500).json({
        error: "Failed to suspend post and update report",
        details: error.message, // Include detailed error
      });
    }
  } else {
    console.error("Invalid request method:", req.method); // Log invalid method
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
