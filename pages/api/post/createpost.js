// api/createpost.js
import fs from "fs";
import path from "path";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { uploadFileToSupabase } from "../../../lib/supabaseHelper";
import formidable from "formidable";

// Disable default bodyParser in Next.js as formidable handles it
export const config = {
  api: {
    bodyParser: false,
  },
};

// Utility function to parse form data
export function parseFormData(req) {
  const form = formidable({ multiples: true, keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Retrieve session
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Parse the form data
      const { fields, files } = await parseFormData(req);

      // Extract fields
      const description = fields.description[0];
      const category_id = fields.category_id[0];

      if (!description || !category_id) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Handle file upload
      const file = files.image[0].filepath;
      const originalFilename = files.image[0].originalFilename;

      if (!file || !originalFilename) {
        return res.status(400).json({ message: "Image file is required" });
      }

      // Upload file to Supabase
      const imageUrl = await uploadFileToSupabase(
        file,
        file,
        originalFilename,
        session.user.id,
        "protecture/post-image"
      );

      if (!imageUrl) {
        return res.status(500).json({ message: "Error uploading file to Supabase" });
      }

      // Create post in the database
      const newPost = await prisma.post.create({
        data: {
          user_id: session.user.id,
          description,
          image_url: imageUrl,
          category_id,
        },
      });

      // Create a notification for successful post creation
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          actionUserId: session.user.id,
          type: "POST_CREATE",
          message: "successfully created a new post.", // Message without "You"
        },
      });

      return res.status(201).json(newPost);
    } catch (error) {
      console.error("Error handling post creation:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
