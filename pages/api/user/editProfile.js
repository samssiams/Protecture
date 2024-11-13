import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import path from 'path';
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing for handling multipart form-data
  },
};

// Helper function to parse form-data
const parseForm = (req) => {
  const form = formidable({
    uploadDir: path.join(process.cwd(), '/public/uploads'), // Adjust path as needed
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Retrieve the session to get the user ID
  const session = await getSession({ req });
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id; // Extract user ID from session

  try {
    // Parse the incoming form data (fields and files)
    const { fields, files } = await parseForm(req);
    console.log("Received fields:", fields); // Log incoming fields to see if they are correct
    console.log("Received files:", files);   // Log incoming files

    // Extract profile data from the request
    const { name, username, profileImageUrl, headerImageUrl } = fields;

    // Prepare data object for the Prisma update
    const dataToUpdate = {};

    // Conditionally add username, name, and images to the update object
    if (username) {
      dataToUpdate.username = username;
    }

    if (name || files.profile_img || files.header_img) {
      dataToUpdate.profile = {
        upsert: {
          create: {
            name: name || undefined,
            profile_img: files.profile_img ? path.join('/uploads', path.basename(files.profile_img.filepath)) : profileImageUrl,
            header_img: files.header_img ? path.join('/uploads', path.basename(files.header_img.filepath)) : headerImageUrl,
          },
          update: {
            ...(name && { name }),
            ...(files.profile_img && { profile_img: path.join('/uploads', path.basename(files.profile_img.filepath)) }),
            ...(files.header_img && { header_img: path.join('/uploads', path.basename(files.header_img.filepath)) }),
          },
        },
      };
    }

    // Perform the update operation
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: {
        ...dataToUpdate,
      },
      include: {
        profile: true, // Include updated profile data in the response
      },
    });

    // Return successful response with the updated user data
    return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error.stack || error); // Log the full error stack for more insights
    return res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
}
