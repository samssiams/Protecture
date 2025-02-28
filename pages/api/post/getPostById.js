// pages/api/post/getPostById.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { postId } = req.query;

  if (!postId) {
    return res.status(400).json({ message: 'Post ID is required.' });
  }

  try {
    // Convert postId to a Number, because your schema uses Int
    const numericPostId = Number(postId);

    // Adjust the fields to match your Post model
    const post = await prisma.post.findUnique({
      where: { id: numericPostId },
      select: {
        image_url: true,
        description: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
