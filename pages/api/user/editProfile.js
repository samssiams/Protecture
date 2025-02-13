import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import path from 'path';
import os from 'os';
import sharp from 'sharp';
import { uploadFileToSupabase } from '../../../lib/supabaseHelper';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // We'll use formidable to parse multipart/form-data
  },
};

// Helper to parse the incoming form data.
const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 2 * 1024 * 1024, // 2 MB limit
    });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate the session.
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = parseInt(session.user.id, 10);

  let fields = {}, files = {};
  try {
    // We expect multipart/form-data.
    const parsed = await parseForm(req);
    fields = parsed.fields;
    files = parsed.files;
  } catch (error) {
    return res.status(400).json({ error: 'Error parsing form data' });
  }

  // Extract name (ensuring it's a string).
  const nameValue =
    fields.name && (Array.isArray(fields.name) ? fields.name[0] : fields.name);

  // Process profile image (if provided) to obtain the public URL.
  let processedProfileUrl = null;
  if (files.profile_img) {
    const file = Array.isArray(files.profile_img)
      ? files.profile_img[0]
      : files.profile_img;
    const originalName = file.originalFilename || file.newFilename;
    // Resize profile image to 300x300.
    const tempPath = path.join(
      os.tmpdir(),
      `resized_profile_${Date.now()}${path.extname(originalName)}`
    );
    await sharp(file.filepath).resize(300, 300).toFile(tempPath);
    // Upload to Supabase bucket "protecture/profileimage" and get the URL.
    processedProfileUrl = await uploadFileToSupabase(
      tempPath,
      tempPath,
      originalName,
      userId,
      'protecture/profileimage'
    );
  }

  // Process header image (if provided) to obtain the public URL.
  let processedHeaderUrl = null;
  if (files.header_img) {
    const file = Array.isArray(files.header_img)
      ? files.header_img[0]
      : files.header_img;
    const originalName = file.originalFilename || file.newFilename;
    // Resize header image to 1200x400.
    const tempPath = path.join(
      os.tmpdir(),
      `resized_header_${Date.now()}${path.extname(originalName)}`
    );
    await sharp(file.filepath).resize(1200, 400).toFile(tempPath);
    // Upload to Supabase bucket "protecture/headerimage" and get the URL.
    processedHeaderUrl = await uploadFileToSupabase(
      tempPath,
      tempPath,
      originalName,
      userId,
      'protecture/headerimage'
    );
  }

  try {
    console.log("Updating user with:", {
      name: nameValue,
      profileURL: processedProfileUrl,
      headerURL: processedHeaderUrl,
    });
    console.log("Updating profile with:", {
      name: nameValue,
      profile_img: processedProfileUrl,
      header_img: processedHeaderUrl,
    });

    // Build the update object for the `user` table.
    const userUpdateData = {
      name: nameValue,
      ...(processedProfileUrl ? { profileURL: processedProfileUrl } : {}),
      ...(processedHeaderUrl ? { headerURL: processedHeaderUrl } : {}),
    };

    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });

    // Build the update object for the `userProfile` table.
    const userProfileUpdateData = {
      name: nameValue,
      ...(processedProfileUrl ? { profile_img: processedProfileUrl } : {}),
      ...(processedHeaderUrl ? { header_img: processedHeaderUrl } : {}),
    };

    await prisma.userProfile.upsert({
      where: { userId },
      update: userProfileUpdateData,
      create: {
        userId,
        name: nameValue,
        profile_img: processedProfileUrl,
        header_img: processedHeaderUrl,
      },
    });

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
