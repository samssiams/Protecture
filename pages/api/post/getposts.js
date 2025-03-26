// pages/api/post/getposts.js
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = session.user.id;
    const { countOnly } = req.query;

    // When countOnly is true, include the filter for posts not in CommunityPost
    if (countOnly === "true") {
      const postCount = await prisma.post.count({
        where: { 
          user_id: userId,
          archived: false,
        },
      });
      return res.status(200).json({ count: postCount });
    }

    // Fetch posts that are not in CommunityPost using the `none` operator.
    const posts = await prisma.post.findMany({
      where: {
        archived: false,
        communityPosts: { none: {} }
      },
      include: {
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profile: { select: { profile_img: true } },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { profile_img: true, name: true } },
          },
        },
        upvotes: {
          where: { user_id: userId },
          select: { id: true },
        },
        downvotes: {
          where: { user_id: userId },
          select: { id: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const postsWithVoteState = posts.map((post) => ({
      ...post,
      comments: post.comments.map((comment) => ({
        id: comment.id,
        userImage: comment.user.profile?.profile_img || "/images/user.svg",
        username: comment.user.username,
        text: comment.comment_text,
        timestamp: comment.created_at,
      })),
      userVote:
        post.upvotes.length > 0
          ? "UPVOTE"
          : post.downvotes.length > 0
          ? "DOWNVOTE"
          : null,
    }));

    return res.status(200).json(postsWithVoteState);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
