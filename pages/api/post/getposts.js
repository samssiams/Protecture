// pages/api/post/getposts.js

import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // ensure user is signed in
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = session.user.id;

    // read query params
    const { limit = "10", category, countOnly } = req.query;

    // if only asking for count of this user's posts
    if (countOnly === "true") {
      const postCount = await prisma.post.count({
        where: {
          user_id: userId,
          archived: false,
        },
      });
      return res.status(200).json({ count: postCount });
    }

    const take = parseInt(limit, 10);

    // build filters
    const whereFilter = {
      archived: false,
      communityPosts: { none: {} },
      ...(category ? { category_id: category } : {}),
    };

    // fetch posts up to `take` with optional category filter
    const posts = await prisma.post.findMany({
      where: whereFilter,
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
      take,
    });

    // reshape for frontend: flatten comments and compute userVote
    const postsWithVoteState = posts.map((post) => ({
      ...post,
      comments: post.comments.map((c) => ({
        id: c.id,
        userImage: c.user.profile?.profile_img || "/images/user.svg",
        username: c.user.username,
        text: c.comment_text,
        timestamp: c.created_at,
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
