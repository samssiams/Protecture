import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Retrieve session from NextAuth
    const session = await getServerSession(req, res, authOptions);

    // Check if session and session.user exist
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized: No session found" });
    }

    // Prefer using the unique id if available, then fallback to email or username
    let user;
    if (session.user.id) {
      user = await prisma.user.findUnique({
        where: { id: parseInt(session.user.id, 10) },
        include: { profile: true },
      });
    } else if (session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { profile: true },
      });
    } else if (session.user.username) {
      user = await prisma.user.findUnique({
        where: { username: session.user.username },
        include: { profile: true },
      });
    } else {
      return res.status(400).json({ error: "Invalid session data" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare the user data for response, using fallbacks if profile data is missing
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
      posts: (user.profile && user.profile.posts) || 0,
      followers: (user.profile && user.profile.followers) || 0,
      following: (user.profile && user.profile.following) || 0,
    };

    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
}
