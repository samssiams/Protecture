// admin-appeal.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, msg } = req.body;
    if (!username || !msg) {
      return res.status(400).json({ error: "Missing username or message" });
    }
    // Find the user by username
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    try {
      const appeal = await prisma.appealRequest.create({
        data: {
          userId: user.id,
          msg,
          status: "pending",
        },
      });
      return res.status(201).json(appeal);
    } catch (error) {
      console.error("Error creating appeal", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "GET") {
    try {
      // Fetch only appeals with "pending" status
      const appeals = await prisma.appealRequest.findMany({
        where: { status: "pending" },
        include: {
          user: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(appeals);
    } catch (error) {
      console.error("Error fetching appeals", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "PATCH") {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "Missing id or status" });
    }
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    try {
      // Update the appeal's status
      const appeal = await prisma.appealRequest.update({
        where: { id: Number(id) },
        data: { status },
      });
      return res.status(200).json(appeal);
    } catch (error) {
      console.error("Error updating appeal", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PATCH"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
