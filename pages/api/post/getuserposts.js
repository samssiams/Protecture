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
    const userId = session.user.id;
    // Use the archived flag from the query (default is false)
    const archivedFlag = req.query.archived === "true";

    const posts = await prisma.post.findMany({
      where: {
        user_id: userId,
        archived: archivedFlag,
      },
      include: {
        comments: {
          include: {
            user: {
              select: {
                username: true,
                profile: { select: { profile_img: true } },
              },
            },
          },
        },
        user: {
          select: {
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
    console.error("Error fetching user posts:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
