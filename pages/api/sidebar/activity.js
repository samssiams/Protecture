import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = session.user.id;
    
    // Retrieve all notifications for the current user along with any actionUser details.
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        actionUser: {
          select: {
            username: true,
            profile: { select: { profile_img: true } },
          },
        },
      },
    });
    
    // Retrieve the current user's profile image to use as a fallback.
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    const currentUserProfileImg = currentUser?.profile?.profile_img || "/images/default-profile.png";
    
    // Map notifications and use the actionUser's profile image if available,
    // otherwise use the current user's profile image.
    const formattedNotifications = notifications.map((notif) => ({
      ...notif,
      profileImg: notif.actionUser?.profile?.profile_img || currentUserProfileImg,
      message: notif.message || "Notification message unavailable",
    }));
    
    return res.status(200).json(formattedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
