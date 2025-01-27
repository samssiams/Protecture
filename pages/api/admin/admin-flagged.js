import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const reports = await prisma.report.findMany({
        include: {
          post: {
            include: {
              user: { // Fetch the details of the reported user
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
          reporter: { // Fetch the details of the user who reported
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      // Format the response for the frontend
      const formattedReports = reports.map((report) => ({
        id: report.id,
        reason: report.reason,
        reportedBy: {
          id: report.reporter.id,
          username: report.reporter.username,
        },
        reportedUser: {
          id: report.post.user.id,
          username: report.post.user.username,
        },
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
      if (action === "dismiss") {
        await prisma.report.delete({
          where: { id: reportId },
        });
        res.status(200).json({ message: "Report dismissed successfully." });
      } else if (action === "suspend") {
        const report = await prisma.report.findUnique({
          where: { id: reportId },
          include: {
            post: {
              select: { userId: true },
            },
          },
        });

        if (!report) {
          return res.status(404).json({ message: "Report not found." });
        }

        // Suspend the user by updating the `suspendedUntil` field
        await prisma.user.update({
          where: { id: report.post.userId },
          data: { suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Suspend for 7 days
        });

        // Delete the report after the action is taken
        await prisma.report.delete({
          where: { id: reportId },
        });

        res.status(200).json({ message: "User suspended successfully." });
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
