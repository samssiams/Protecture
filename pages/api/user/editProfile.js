// /pages/api/user/editprofile.js
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import { getSession } from 'next-auth/react';
import { uploadFileToSupabase } from '../../../lib/supabaseHelper';

const prisma = new PrismaClient();

export const config = {
  api: {
    // We disable the default body parser to allow us to conditionally parse.
    bodyParser: false,
  },
};

// Helper to parse multipart/form-data with formidable.
const parseForm = (req) => {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024, // 2 MB limit (adjust as needed)
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Helper to parse JSON from the request body.
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
    req.on('error', reject);
  });

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get the session.
  const session = await getSession({ req });
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = session.user.id;

  let fields = {};
  let files = {};

  // Determine how to parse the incoming request.
  const contentType = req.headers['content-type'] || '';
  try {
    if (contentType.includes('multipart/form-data')) {
      const parsed = await parseForm(req);
      fields = parsed.fields;
      files = parsed.files;
    } else {
      fields = await parseJSON(req);
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return res.status(400).json({ error: 'Error parsing request body' });
  }

  // When using formidable, fields may be arrays so we take the first value.
  const nameVal = Array.isArray(fields.name) ? fields.name[0] : fields.name;
  const profileImgVal = Array.isArray(fields.profile_img)
    ? fields.profile_img[0]
    : fields.profile_img;
  const headerImgVal = Array.isArray(fields.header_img)
    ? fields.header_img[0]
    : fields.header_img;

  const userUpdateData = {};
  const profileUpdateData = {};

  // Update the profile name if provided.
  if (nameVal) profileUpdateData.name = nameVal;
  // Update image URLs if provided in the fields.
  if (profileImgVal) profileUpdateData.profile_img = profileImgVal;
  if (headerImgVal) profileUpdateData.header_img = headerImgVal;

  // Process profile image file if provided.
  if (files.profile_img) {
    const file = files.profile_img;
    const filePath = file.filepath;
    const originalFilename = file.originalFilename;
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

  // Process header image file if provided.
  if (files.header_img) {
    const file = files.header_img;
    const filePath = file.filepath;
    const originalFilename = file.originalFilename;
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

  try {
    // Update the user record if needed (e.g., username, if ever provided)
    if (fields.username) {
      await prisma.user.update({
        where: { id: parseInt(userId, 10) },
        data: { username: Array.isArray(fields.username) ? fields.username[0] : fields.username },
      });
    }

    // Upsert the profile record.
    await prisma.userProfile.upsert({
      where: { userId: parseInt(userId, 10) },
      update: profileUpdateData,
      create: { ...profileUpdateData, userId: parseInt(userId, 10) },
    });

    // Create a notification about the profile update.
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
