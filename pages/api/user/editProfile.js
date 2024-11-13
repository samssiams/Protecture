import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for multipart form-data handling
  },
};

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to parse form-data
const parseForm = (req) => {
  const form = formidable({
    uploadDir, // Use prepared upload directory
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024, // Set file size limit (2 MB in this case)
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

  const session = await getSession({ req });
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;

  try {
    const { fields, files } = await parseForm(req);

    // Log parsed fields and files
    console.log("Received fields:", fields);
    console.log("Received files:", files);

    const { name, username, profileImageUrl, headerImageUrl } = fields;

    const userUpdateData = {};
    const profileUpdateData = {};

    // Update username in the User model
    if (username) {
      userUpdateData.username = username;
    }

    // Update fields in the UserProfile model
    if (name) {
      profileUpdateData.name = name;
    }
    if (files.profile_img) {
      profileUpdateData.profile_img = `/uploads/${path.basename(files.profile_img.filepath)}`;
    }
    if (files.header_img) {
      profileUpdateData.header_img = `/uploads/${path.basename(files.header_img.filepath)}`;
    }

    // Perform the update operations
    const [updatedUser, updatedProfile] = await Promise.all([
      prisma.user.update({
        where: { id: parseInt(userId, 10) },
        data: userUpdateData,
      }),
      prisma.userProfile.upsert({
        where: { userId: parseInt(userId, 10) },
        update: profileUpdateData,
        create: { ...profileUpdateData, userId: parseInt(userId, 10) },
      })
    ]);

    // Return successful response with the updated user data
    return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error.stack || error);
    return res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
}
