import prisma from "../../../lib/prisma";


export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    try {
      // Remove the suspension
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { suspendedUntil: null },
      });

      res.status(200).json({
        message: "User has been successfully unsuspended.",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error unsuspending user:", error);
      res.status(500).json({ message: "Failed to unsuspend user." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}
