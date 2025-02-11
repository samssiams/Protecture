// /pages/api/user/editprofile.js

import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import { getSession } from "next-auth/react";
import { uploadFileToSupabase } from '../../../lib/supabaseHelper';

const prisma = new PrismaClient();

export const config = {
  api: {
    // Disable the default body parser so we can use our custom logic.
    bodyParser: false,
  },
};

// Helper to parse multipart/form-data using formidable
const parseForm = (req) => {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024, // 2 MB
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Helper to parse a JSON body from a stream
const parseJSON = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (err) => reject(err));
  });

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
    let fields = {};
    let files = {};

    // Check the content-type header. If it contains 'multipart/form-data', use formidable.
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      const parsed = await parseForm(req);
      fields = parsed.fields;
      files = parsed.files;
    } else {
      // Otherwise, assume JSON.
      fields = await parseJSON(req);
    }

    // Extract fields (name and username)
    const { name, username } = fields;
    const userUpdateData = {};
    const profileUpdateData = {};

    if (username) userUpdateData.username = username;
    if (name) profileUpdateData.name = name;

    // Process profile image if provided (as a file field named 'profile_img')
    if (files.profile_img) {
      const filePath = files.profile_img.filepath;
      const originalFilename = files.profile_img.originalFilename;
      const publicUrl = await uploadFileToSupabase(
        filePath,
        filePath,
        originalFilename,
        userId,
        "protecture/profileimage"
      );
      if (!publicUrl) {
        return res.status(500).json({ error: 'Error uploading profile image' });
      }
      profileUpdateData.profile_img = publicUrl;
    }

    // Process header image if provided (as a file field named 'header_img')
    if (files.header_img) {
      const filePath = files.header_img.filepath;
      const originalFilename = files.header_img.originalFilename;
      const publicUrl = await uploadFileToSupabase(
        filePath,
        filePath,
        originalFilename,
        userId,
        "protecture/headerimage"
      );
      if (!publicUrl) {
        return res.status(500).json({ error: 'Error uploading header image' });
      }
      profileUpdateData.header_img = publicUrl;
    }

    // Update username (in User) if provided.
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: parseInt(userId, 10) },
        data: userUpdateData,
      });
    }

    // Upsert the profile data (in UserProfile)
    await prisma.userProfile.upsert({
      where: { userId: parseInt(userId, 10) },
      update: profileUpdateData,
      create: { ...profileUpdateData, userId: parseInt(userId, 10) },
    });

    // Create a notification for the update.
    await prisma.notification.create({
      data: {
        userId: parseInt(userId, 10),
        actionUserId: parseInt(userId, 10),
        type: 'PROFILE_UPDATE',
        message: 'You have updated your profile.',
      },
    });

    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}
