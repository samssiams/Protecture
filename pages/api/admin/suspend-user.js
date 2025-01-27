import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    try {
      // Calculate the suspension end time (1 hour from now)
      const suspendedUntil = new Date();
      suspendedUntil.setHours(suspendedUntil.getHours() + 1);

      // Update the user's suspension status
      await prisma.user.update({
        where: { id: userId },
        data: { suspendedUntil },
      });

      res.status(200).json({ message: "User suspended for 1 hour." });
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ error: "Failed to suspend user." });
    }
  } else {
    // Handle unsupported methods
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
