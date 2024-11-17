import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth"; // Import NextAuth session
import { authOptions } from "../auth/[...nextauth]"; // Import auth options for session handling

export default async function handler(req, res) {
  if (req.method === "GET") {
    console.log("Received GET request to fetch all posts...");

    try {
      // Get the session to identify the logged-in user
      const session = await getServerSession(req, res, authOptions);

      let userId = null;
      if (session && session.user) {
        userId = session.user.id;
        console.log(`Fetching posts for user ID: ${userId}`);
      }

      // Fetch all posts with related user and comment data
      const posts = await prisma.post.findMany({
        include: {
          comments: true, // Include related comments
          user: {
            select: {
              username: true, // Fetch username from User
              profile: {
                select: {
                  profile_img: true, // Fetch profile_img from UserProfile
                  name: true, // Fetch name from UserProfile
                },
              },
            },
          },
          upvotes: {
            where: { user_id: userId }, // Check if the user has upvoted
            select: { id: true },
          },
          downvotes: {
            where: { user_id: userId }, // Check if the user has downvoted
            select: { id: true },
          },
        },
        orderBy: {
          created_at: "desc", // Sort posts by creation date, newest first
        },
      });

      // Map the posts to include the voting state for the current user
      const postsWithVoteState = posts.map((post) => ({
        ...post,
        userVote: post.upvotes.length > 0
          ? "UPVOTE"
          : post.downvotes.length > 0
          ? "DOWNVOTE"
          : null, // Determine the user's vote state
      }));

      console.log(`Fetched ${posts.length} posts.`); // Log the number of posts fetched
      return res.status(200).json(postsWithVoteState); // Return all posts to the client
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // If the request method is not GET, return 405 (Method Not Allowed)
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}