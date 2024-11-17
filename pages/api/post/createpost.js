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
  const form = formidable({ multiples: true, keepExtensions: true }); // Initialize formidable

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err); // Reject the promise on error
      } else {
        // Parse JSON strings into nested objects if necessary
        for (const key in fields) {
          try {
            fields[key] = JSON.parse(fields[key]); // Attempt to parse JSON strings
          } catch (e) {
            // Leave the field as-is if it's not JSON
          }
        }
        resolve({ fields, files }); // Resolve the promise with parsed fields and files
      }
    });
  });
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Retrieve session
      const session = await getServerSession(req, res, authOptions);

      console.log("Session data:", session); // Log session details

      if (!session || !session.user) {
        console.log("Unauthorized access attempt. Session or user missing.");
        return res.status(401).json({ message: "Unauthorized" });
      }

      try {
        // Parse the form data using the utility function
        const { fields, files } = await parseFormData(req);

        console.log("Received fields:", fields);
        console.log("Received files:", files);

        // Convert description and category_id to strings
        const description = fields.description[0]; // Extract the first value from the array
        const category_id = fields.category_id[0]; // Extract the first value from the array

        if (!description || !category_id) {
          console.log("Missing required fields:", { description, category_id });
          return res.status(400).json({ message: "All fields are required" });
        }

        const file = files.image[0].filepath; // Filepath of the uploaded image
        const originalFilename = files.image[0].originalFilename;

        if (!file || !originalFilename) {
          console.log("Image file is missing:", { file, originalFilename });
          return res.status(400).json({ message: "Image file is required" });
        }

        // Log file details
        console.log("File path:", file);
        console.log("Original filename:", originalFilename);

        // Upload file to Supabase
        const imageUrl = await uploadFileToSupabase(
          file,
          file, // File path
          originalFilename,
          session.user.id,
          "protecture/post-image"
        );

        if (!imageUrl) {
          console.error("Error uploading file to Supabase");
          return res
            .status(500)
            .json({ message: "Error uploading file to Supabase" });
        }

        console.log("Image successfully uploaded. URL:", imageUrl);

        // Create post in the database
        const newPost = await prisma.post.create({
          data: {
            user_id: session.user.id, // Assuming user_id matches session user ID
            description, // Now a string
            image_url: imageUrl,
            category_id, // Now a string
          },
        });

        console.log("Post created successfully:", newPost);
        return res.status(201).json(newPost);
      } catch (err) {
        console.error("Error parsing form data:", err);
        return res.status(500).json({ message: "Error parsing form data" });
      }
    } catch (error) {
      console.error("Error handling post creation:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    console.log("Invalid request method:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }
}
