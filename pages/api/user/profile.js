import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized: No session found" });
    }

    // If a userId is provided via query, use that; otherwise, default to the current user's id.
    const requestedUserId = req.query.userId
      ? parseInt(req.query.userId, 10)
      : parseInt(session.user.id, 10);  

    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
      include: { profile: true, posts: true },  // Include posts to count
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = {
      username: user.username,
      name: (user.profile && user.profile.name) || user.name || "",
      profileImg:
        (user.profile && user.profile.profile_img) ||
        user.profileURL ||
        "/images/default-profile.png",
      headerImg:
        (user.profile && user.profile.header_img) ||
        user.headerURL ||
        "/images/default-header.png",
      posts: user.posts.length || 0, // Properly count posts
      followers: (user.profile && user.profile.followers) || 0,
      following: (user.profile && user.profile.following) || 0,
    };

    return res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
}
