import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { postId, reason, reportedBy } = req.body;

    if (!postId || !reason || !reportedBy) {
      return res.status(400).json({ message: 'Post ID, reason, and reporter ID are required.' });
    }

    try {
      const report = await prisma.report.create({
        data: {
          postId,
          reportedBy,
          reason,
        },
      });
      return res.status(200).json({ message: 'Report submitted successfully.', report });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed.' });
  }
}
