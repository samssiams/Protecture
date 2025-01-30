// pages/api/community/create.js

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Retrieve session
    const session = await getServerSession(req, res, authOptions);

    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required" });
    }

    // Check if community name already exists
    const existingCommunity = await prisma.community.findUnique({
      where: { name },
    });

    if (existingCommunity) {
      return res.status(400).json({ error: "Community name already exists" });
    }

    // Get user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create the community
    const community = await prisma.community.create({
      data: {
        name,
        description,
        ownerId: user.id,
        status: "PENDING",
      },
    });

    // Add the creator as a member of the community
    await prisma.communityMember.create({
      data: {
        communityId: community.id,
        userId: user.id,
      },
    });

    res.status(201).json({ message: "Community created successfully", community });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
