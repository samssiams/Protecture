// pages/api/user/get-report-reason.js
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  }

  const { username } = req.query;
  if (!username) {
    return res
      .status(400)
      .json({ message: "Username query parameter is required." });
  }

  try {
    const userRecord = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
      },
    });
    if (!userRecord) {
      return res.status(404).json({ message: "User not found." });
    }
    const userId = userRecord.id;

    const report = await prisma.report.findFirst({
      where: {
        post: {
          user_id: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        reason: true,
      },
    });

    if (!report) {
      return res
        .status(404)
        .json({ message: "No report found for this user." });
    }

    return res.status(200).json({ reason: report.reason });
  } catch (error) {
    console.error("Error fetching report:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
