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

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch communities — example shows retrieving APPROVED communities
    // Modify as needed for your specific requirements
    const communities = await prisma.community.findMany({
      where: { status: "APPROVE" },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map the result to include whether the user is a member
    const data = communities.map((community) => ({
      id: community.id,
      name: community.name,
      joined: community.members.length > 0,
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
