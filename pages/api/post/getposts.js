import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth"; // Import NextAuth session
import { authOptions } from "../auth/[...nextauth]"; // Import auth options for session handling

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

      // Get the current route from the query parameters
      const { currentPath } = req.query;
      let posts;

      if (currentPath === "/home/profile") {
        console.log("Fetching posts only for the logged-in user...");
        // Filter posts to only those created by the logged-in user
        posts = await prisma.post.findMany({
          where: { user_id: userId },
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
            created_at: "desc", // Sort posts by creation date, newest first
          },
        });
      } else {
        console.log("Fetching all posts...");
        // Fetch all posts without filtering
        posts = await prisma.post.findMany({
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
            created_at: "desc", // Sort posts by creation date, newest first
          },
        });
      }

      // Map the posts to include the voting state for the current user
      const postsWithVoteState = posts.map((post) => ({
        ...post,
        comments: post.comments.map((comment) => ({
          id: comment.id,
          userImage: comment.user.profile?.profile_img || "/images/user.svg",
          username: comment.user.username,
          text: comment.comment_text,
          timestamp: comment.created_at,
        })), // Transform comments to include user details
        userVote: post.upvotes.length > 0
          ? "UPVOTE"
          : post.downvotes.length > 0
          ? "DOWNVOTE"
          : null, // Determine the user's vote state
      }));

      console.log(`Fetched ${posts.length} posts.`); // Log the number of posts fetched
      return res.status(200).json(postsWithVoteState); // Return posts to the client
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // If the request method is not GET, return 405 (Method Not Allowed)
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
