import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { postId, userId, commentText } = req.body;

    if (!postId || !userId || !commentText) {
      return res.status(400).json({ error: 'postId, userId, and commentText are required' });
    }

    try {
      // Create a new comment in the database
      const newComment = await prisma.comment.create({
        data: {
          post_id: postId,
          user_id: userId,
          comment_text: commentText,
        },
        include: {
          user: {
            select: {
              username: true,
              profile: {
                select: {
                  profile_img: true,
                },
              },
            },
          },
        },
      });

      // Return the new comment with user details
      return res.status(201).json({
        id: newComment.id,
        text: newComment.comment_text,
        timestamp: new Date(newComment.created_at).toLocaleTimeString(),
        userImage: newComment.user.profile?.profile_img || '/images/user.svg',
        username: newComment.user.username,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({ error: 'An error occurred while adding the comment' });
    }
  } else {
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
