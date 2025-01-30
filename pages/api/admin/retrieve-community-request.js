// pages/api/admin/retrieve-community-request.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch communities with status "PENDING"
    const pendingCommunities = await prisma.community.findMany({
      where: { status: "PENDING" },
      include: {
        owner: {
          select: { username: true, email: true },
        },
      },
    });

    res.status(200).json(pendingCommunities);
  } catch (error) {
    console.error("Error retrieving community requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
