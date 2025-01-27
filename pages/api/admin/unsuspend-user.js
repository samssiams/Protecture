import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    try {
      // Update the user's suspension status to remove suspension
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { suspendedUntil: null },
      });

      return res.status(200).json({
        message: "User has been successfully unsuspended.",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error unsuspending user:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else {
    // Handle unsupported methods
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}
