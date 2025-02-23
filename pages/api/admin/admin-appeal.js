// admin-appeal api (admin-appeal.js)
import prisma from "../../../lib/prisma";


export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, msg } = req.body;
    if (!username || !msg) {
      return res.status(400).json({ error: "Missing username or message" });
    }
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
      const appealRecord = await prisma.appealRequest.findUnique({
        where: { id: Number(id) },
      });
      if (!appealRecord) {
        return res.status(404).json({ error: "Appeal not found" });
      }
      const updatedAppeal = await prisma.appealRequest.update({
        where: { id: Number(id) },
        data: { status },
      });
      if (status === "accepted") {
        await prisma.user.update({
          where: { id: appealRecord.userId },
          data: { suspendedUntil: null },
        });
      }
      return res.status(200).json(updatedAppeal);
    } catch (error) {
      console.error("Error updating appeal", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PATCH"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
