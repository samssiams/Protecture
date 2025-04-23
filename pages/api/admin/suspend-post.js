// File: /pages/api/admin/suspend-post.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ error: `Method ${req.method} not allowed` });
  }

  const { reportId } = req.body;

  if (!reportId) {
    return res.status(400).json({ error: "Report ID is required" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const report = await tx.report.update({
        where: { id: reportId },
        data: { status: "FULFILLED" },
        select: { id: true, postId: true },
      });

      if (!report.postId)
        throw new Error("No related post found for this report");

      const post = await tx.post.update({
        where: { id: report.postId },
        data: { status: "FULFILLED", archived: true },
      });

      return { report, post };
    });

    return res.status(200).json({
      message: "Report fulfilled and post suspended",
      ...result,
    });
  } catch (error) {
    console.error("suspend-post error:", error);
    return res.status(500).json({
      error: "Failed to update report and related post",
      details: error.message,
    });
  }
}
