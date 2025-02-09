import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    console.error("[ERROR] Invalid method. Only GET allowed.");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { postId } = req.query;

  if (!postId) {
    console.error("[ERROR] Missing postId.");
    return res.status(400).json({ error: "Post ID is required" });
  }

  try {
    // Retrieve the current session (if available)
    const session = await getServerSession(req, res, authOptions);
    const currentUserId = session?.user?.id;

    // Fetch comments for the post along with the user and profile data
    const comments = await prisma.comment.findMany({
      where: { post_id: parseInt(postId, 10) },
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: { select: { profile_img: true } },
          },
        },
      },
    });

    // Map over the comments to shape the response and flag comments by the current user
    const responseComments = comments.map((comment) => {
      const profileImageUrl = comment.user?.profile?.profile_img
        ? `/uploads/${comment.user.profile.profile_img}`
        : "/images/default-avatar.png";

      return {
        id: comment.id,
        text: comment.comment_text,
        username: comment.user?.username || "Anonymous",
        userImage: profileImageUrl,
        timestamp: comment.created_at,
        edited: comment.edited,
        isCurrentUser: currentUserId && comment.user?.id === currentUserId,
      };
    });

    return res.status(200).json(responseComments);
  } catch (error) {
    console.error("[ERROR] Error fetching comments:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
