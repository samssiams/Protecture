// pages/api/community/get-community.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const communities = await prisma.community.findMany({
      where: { status: "APPROVE" },
      include: { members: true },
      orderBy: { createdAt: "desc" },
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const formatted = communities.map((c) => ({
      id: c.id,
      name: c.name,
      joined: c.members.some(
        (m) => m.userId === user.id && m.status === "joined"
      ),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
