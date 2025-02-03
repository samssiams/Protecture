import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = session.user.id;

      // Fetch notifications for the logged-in user
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          actionUser: { 
            select: {
              username: true,
              profile: { select: { profile_img: true } },
            },
          },
        },
      });

      const formattedNotifications = notifications.map((notif) => {
        let message = notif.message || "Notification message unavailable"; // Ensure message is never undefined

        return {
          ...notif,
          profileImg: notif.actionUser?.profile?.profile_img || '/images/default-profile.png',
          message,
        };
      });

      res.status(200).json(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
