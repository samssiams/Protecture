// File: /pages/api/admin/admin-flagged.js

import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const reports = await prisma.report.findMany({
        where: {
          status: "PENDING", // Only fetch pending reports
        },
        include: {
          post: {
            include: {
              user: { 
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
          reporter: { 
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      const formattedReports = reports.map((report) => ({
        reportId: report.id, 
        postId: report.post?.id || null, 
        reason: report.reason,
        reportedBy: {
          id: report.reporter?.id || null,
          username: report.reporter?.username || "Unknown",
        },
        reportedUser: {
          id: report.post?.user?.id || null,
          username: report.post?.user?.username || "Unknown",
        },
        status: report.status,
        createdAt: report.createdAt,
      }));

      res.status(200).json({ reports: formattedReports });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  } else if (req.method === "POST") {
    const { reportId, action } = req.body;

    if (!reportId || !action) {
      return res.status(400).json({ message: "Report ID and action are required." });
    }

    try {
      let updatedReport;
      
      if (action === "reject") {
        updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: { status: "REJECTED" },
          select: { id: true, status: true },
        });
        res.status(200).json({ message: "Report rejected successfully.", updatedReport });
      } else if (action === "suspend") {
        const report = await prisma.report.findUnique({
          where: { id: reportId },
          include: {
            post: {
              include: {
                user: { select: { id: true } }, // Ensure user ID is fetched
              },
            },
          },
        });

        if (!report || !report.post || !report.post.user) {
          return res.status(404).json({ message: "Report, post, or user not found." });
        }

        await prisma.user.update({
          where: { id: report.post.user.id },
          data: { suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7-day suspension
        });

        await prisma.post.update({
          where: { id: report.post.id },
          data: { status: "SUSPENDED" },
        });

        updatedReport = await prisma.report.update({
          where: { id: reportId },
          data: { status: "FULFILLED" },
          select: { id: true, status: true },
        });

        res.status(200).json({ message: "User suspended successfully.", updatedReport });
      } else {
        res.status(400).json({ message: "Invalid action." });
      }
    } catch (error) {
      console.error("Error processing admin action:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
