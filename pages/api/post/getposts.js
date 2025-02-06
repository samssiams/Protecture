import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next"; // Use this if you're on NextAuth v4
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method === "GET") {
    console.log("Received GET request to fetch posts...");

    try {
      // Get the session to identify the logged-in user
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = session.user.id;
      console.log(`Logged-in user ID: ${userId}`);

      // Extract query parameters
      const { countOnly, archived, currentPath } = req.query;

      if (countOnly === "true") {
        console.log("Fetching post count for the logged-in user...");

        // Count the posts created by the logged-in user (excluding archived posts)
        const postCount = await prisma.post.count({
          where: { user_id: userId, archived: false },
        });

        console.log(`Post count for user ${userId}: ${postCount}`);
        return res.status(200).json({ count: postCount });
      }

      let posts;

      if (currentPath === "/home/profile") {
        console.log("Fetching posts only for the logged-in user...");
        // Fetch posts created by the logged-in user; use the archived flag from the query
        posts = await prisma.post.findMany({
          where: {
            user_id: userId,
            archived: archived === "true",
          },
          include: {
            comments: {
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
            },
            user: {
              select: {
                username: true,
                profile: {
                  select: {
                    profile_img: true,
                    name: true,
                  },
                },
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
          orderBy: {
            created_at: "desc",
          },
        });
      } else {
        console.log("Fetching all posts...");
        // Fetch all non-archived posts
        posts = await prisma.post.findMany({
          where: {
            archived: false,
          },
          include: {
            comments: {
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
            },
            user: {
              select: {
                username: true,
                profile: {
                  select: {
                    profile_img: true,
                    name: true,
                  },
                },
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
          orderBy: {
            created_at: "desc",
          },
        });
      }

      // Map posts to include the current user's vote state and transform comments
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

      console.log(`Fetched ${posts.length} posts.`);
      return res.status(200).json(postsWithVoteState);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // If the request method is not GET, return 405 (Method Not Allowed)
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
