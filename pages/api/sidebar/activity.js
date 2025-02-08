// pages/api/sidebar/activity.js
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const session = await getServerSession(req, res, authOptions);

    // Verify that session and session.user exist
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        // actionUser is optional. If a notification isn’t associated with an action user,
        // a default profile image will be used.
        actionUser: {
          select: {
            username: true,
            profile: { select: { profile_img: true } },
          },
        },
      },
    });

    // Format notifications to include a profile image and a fallback message.
    const formattedNotifications = notifications.map((notif) => ({
      ...notif,
      profileImg:
        notif.actionUser?.profile?.profile_img || "/images/default-profile.png",
      message: notif.message || "Notification message unavailable",
    }));

    return res.status(200).json(formattedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
