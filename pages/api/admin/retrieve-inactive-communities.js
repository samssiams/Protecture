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
    const inactiveCommunities = await prisma.community.findMany({
      where: { status: "INACTIVE" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        lastPostAt: true,
        owner: { select: { username: true, email: true } },
        members: {
          where: { status: "joined" },
          select: { userId: true },
        },
      },
    });
    res.status(200).json(inactiveCommunities);
  } catch (error) {
    console.error("Error retrieving inactive communities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
