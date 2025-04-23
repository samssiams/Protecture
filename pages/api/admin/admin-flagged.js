// File: /pages/api/admin/admin-flagged.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return getReports(req, res);
    case "POST":
      return processReport(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ message: `Method ${req.method} not allowed.` });
  }
}

async function getReports(_, res) {
  try {
    const reports = await prisma.report.findMany({
      where: { status: "PENDING" },
      include: {
        post: { include: { user: { select: { id: true, username: true } } } },
        reporter: { select: { id: true, username: true } },
      },
    });

    const formatted = reports.map((r) => ({
      reportId: r.id,
      postId: r.post?.id ?? null,
      reason: r.reason,
      reportedBy: {
        id: r.reporter?.id ?? null,
        username: r.reporter?.username ?? "Unknown",
      },
      reportedUser: {
        id: r.post?.user?.id ?? null,
        username: r.post?.user?.username ?? "Unknown",
      },
      status: r.status,
      createdAt: r.createdAt,
      postStatus: r.post?.status ?? null,
    }));

    return res.status(200).json({ reports: formatted });
  } catch (err) {
    console.error("GET /admin-flagged:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function processReport(req, res) {
  const { reportId, action } = req.body;
  if (!reportId || !action) {
    return res
      .status(400)
      .json({ message: "Report ID and action are required." });
  }

  try {
    if (action === "reject") {
      const rejected = await prisma.report.update({
        where: { id: reportId },
        data: { status: "REJECTED" },
      });
      return res
        .status(200)
        .json({ message: "Report rejected successfully.", report: rejected });
    }

    if (action === "suspend") {
      const result = await prisma.$transaction(async (tx) => {
        const report = await tx.report.update({
          where: { id: reportId },
          data: { status: "FULFILLED" },
          select: { id: true, postId: true },
        });

        if (!report.postId) throw new Error("Report has no related post.");

        const postOwner = await tx.post.findUnique({
          where: { id: report.postId },
          select: { user_id: true },
        });

        await tx.user.update({
          where: { id: postOwner.user_id },
          data: { suspendedUntil: new Date(Date.now() + 7 * 86400000) },
        });

        const post = await tx.post.update({
          where: { id: report.postId },
          data: { archived: true, status: "FULFILLED" },
        });

        return { report, post };
      });

      return res.status(200).json({
        message: "Post suspended and report fulfilled.",
        ...result,
      });
    }

    return res.status(400).json({ message: "Invalid action." });
  } catch (err) {
    console.error("POST /admin-flagged:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
