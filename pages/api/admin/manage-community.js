// pages/api/admin/manage-community.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { communityId, action } = req.body;

  if (!communityId || !action) {
    return res.status(400).json({ error: "communityId and action are required" });
  }

  if (!["APPROVE", "REJECT"].includes(action.toUpperCase())) {
    return res.status(400).json({ error: "Invalid action. Use 'APPROVE' or 'REJECT'." });
  }

  try {
    // Update the community status
    const updatedCommunity = await prisma.community.update({
      where: { id: communityId },
      data: { status: action.toUpperCase() },
    });

    res.status(200).json({
      message: `Community ${action.toLowerCase()}d successfully.`,
      community: updatedCommunity,
    });
  } catch (error) {
    console.error("Error managing community:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
