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
    // Fetch approved communities
    const communities = await prisma.community.findMany({
      where: { status: "APPROVE" },
      include: { members: true },
      orderBy: { createdAt: "desc" },
    });
    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    const formatted = communities.map((community) => ({
      id: community.id,
      name: community.name,
      joined: community.members.some(
        (member) => member.userId === user.id && member.status === "joined"
      ),
    }));
    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}