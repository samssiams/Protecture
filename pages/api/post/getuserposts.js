// pages/api/post/getuserposts.js
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

    // If a userId is provided in the query, use that; otherwise, default to the current user's id.
    const requestedUserId = req.query.userId
      ? parseInt(req.query.userId, 10)
      : parseInt(session.user.id, 10);

    const archivedFlag = req.query.archived === "true";

    const posts = await prisma.post.findMany({
      where: {
        user_id: requestedUserId,
        archived: archivedFlag,
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
          // upvotes are still filtered for the current session user
          where: { user_id: parseInt(session.user.id, 10) },
          select: { id: true },
        },
        downvotes: {
          where: { user_id: parseInt(session.user.id, 10) },
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
    console.error("Error fetching user posts:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
