// pages/api/post/reportuser.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { postId, reason, reportedBy } = req.body;

    if (!postId || !reason || !reportedBy) {
      return res.status(400).json({ message: 'Post ID, reason, and reporter ID are required.' });
    }

    try {
      // Fetch the post along with the username of the user who created it
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { user: { select: { username: true } } },
      });

      if (!post || !post.user) {
        return res.status(404).json({ message: 'Post not found or has no owner.' });
      }

      const postOwnerUsername = post.user.username; // The username of the post's owner

      // Create the report
      const report = await prisma.report.create({
        data: {
          postId,
          reportedBy,
          reason,
        },
      });

      // Create a notification for the reporter
      await prisma.notification.create({
        data: {
          userId: reportedBy,
          actionUserId: reportedBy,
          type: 'REPORT_SUBMITTED',
          message: `You reported ${postOwnerUsername}'s post.`,
        },
      });

      return res.status(200).json({
        message: 'Report submitted successfully.',
        triggerRefresh: true, // Add a triggerRefresh flag for client-side refresh
        report,
      });
    } catch (error) {
      console.error('Error creating report or notification:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed.' });
  }
}
