// pages/api/community/get-community.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Retrieve the session using getServerSession
    const session = await getServerSession(req, res, authOptions);

    // Ensure session and session.user exist
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find the user in the database using session data (using email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch communities — retrieving APPROVED communities and including:
    // - the current user's membership (for the join button)
    // - the total member count using _count
    const communities = await prisma.community.findMany({
      where: { status: "APPROVE" },
      include: {
        members: {
          where: { userId: user.id },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map the result to include community description and member count
    const data = communities.map((community) => ({
      id: community.id,
      name: community.name,
      description: community.description,
      joined: community.members.filter((m) => m.status === "joined").length > 0,
      memberCount: community.members.filter((m) => m.status === "joined").length,
    }));

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
