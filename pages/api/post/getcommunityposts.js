import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Get the session to identify the logged-in user
      const session = await getServerSession(req, res, authOptions);
      const userId = session.user.id;

      // Extract query parameters
      const { countOnly, archived, communityId } = req.query;

      if (!communityId) {
        return res.status(400).json({ message: "communityId is required" });
      }

      if (countOnly === "true") {
        // Count the posts in the specified community
        const postCount = await prisma.communityPost.count({
          where: {
            communityId: parseInt(communityId, 10),
            post: {
              archived: archived === "true" ? true : false,
            },
          },
        });

        return res.status(200).json({ count: postCount });
      }

      // Fetch posts associated with the specified community
      const communityPosts = await prisma.communityPost.findMany({
        where: {
          communityId: parseInt(communityId, 10),
          post: {
            archived: archived === "true" ? true : false,
          },
        },
        include: {
          post: {
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
                  id: true, // Added user id here
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
          },
          community: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          post: {
            created_at: "desc",
          },
        },
      });

      // Map the communityPosts to include the voting state for the current user and the poster's id
      const postsWithVoteState = communityPosts.map((communityPost) => ({
        ...communityPost.post,
        community: communityPost.community.name,
        userId: communityPost.post.user.id, // Add the user id of the poster
        comments: communityPost.post.comments.map((comment) => ({
          id: comment.id,
          userImage: comment.user.profile?.profile_img || "/images/user.svg",
          username: comment.user.username,
          text: comment.comment_text,
          timestamp: comment.created_at,
        })), // Transform comments to include user details
        userVote:
          communityPost.post.upvotes.length > 0
            ? "UPVOTE"
            : communityPost.post.downvotes.length > 0
            ? "DOWNVOTE"
            : null, // Determine the user's vote state
      }));

      return res.status(200).json(postsWithVoteState);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // If the request method is not GET, return 405 (Method Not Allowed)
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
