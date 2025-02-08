// pages/api/user/profile.js

import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    console.log("Invalid request method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Retrieve the session using getServerSession
    const session = await getServerSession(req, res, authOptions);

    // Verify that the session and session.user exist
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract username and email from the session user object
    const { username, email } = session.user;
    console.log("Extracted username:", username, "email:", email);

    // Ensure that a unique identifier is present
    if (!username && !email) {
      console.log("No unique identifier found in session");
      return res.status(400).json({ error: "Invalid session data" });
    }

    // Fetch the user profile using either username or email as a unique identifier
    const user = await prisma.user.findUnique({
      where: {
        username: username || undefined,
        email: username ? undefined : email, // Use email if username is not present
      },
      include: {
        profile: true, // Fetch the profile associated with the user
      },
    });

    // Handle case where user or user profile is not found
    if (!user || !user.profile) {
      console.log(`User profile not found for identifier: ${username || email}`);
      return res.status(404).json({ error: "User profile not found" });
    }

    // Prepare the user profile data for the response
    const userData = {
      username: user.username,
      name: user.profile.name,
      profileImg: user.profile.profile_img || "/images/default-profile.png",
      headerImg: user.profile.header_img || "/images/default-header.png",
      posts: user.profile.posts || 0,
      followers: user.profile.followers || 0,
      following: user.profile.following || 0,
    };

    return res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
}
