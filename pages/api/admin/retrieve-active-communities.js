import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const activeCommunities = await prisma.community.findMany({
      where: { status: "APPROVE" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,   // still needed for stale-warning fallback
        lastPostAt: true,  // still needed for stale-warning
        owner: { select: { username: true, email: true } },
        members: {
          where: { status: "joined" },
          select: { userId: true },
        },
      },
    });

    res.status(200).json(activeCommunities);
  } catch (error) {
    console.error("Error retrieving active communities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
