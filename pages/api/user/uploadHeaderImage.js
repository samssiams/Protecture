// /api/user/uploadHeaderImage.js
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { uploadFileToSupabase } from '../../../lib/supabaseHelper';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  console.log("UploadHeaderImage API called");

  const session = await getServerSession(req, res, authOptions);
  console.log("Session:", session);
  if (!session || !session.user) {
    console.log("Unauthorized access attempt");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    let files; // Declare files for use in finally block
    try {
      ({ files } = await parseForm(req));
      let file = files.file;
      // If file is an array, get the first element.
      const fileData = Array.isArray(file) ? file[0] : file;
      console.log("Uploaded file info:", fileData);
      if (!fileData) {
        console.log("No file uploaded");
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // No MIME type check is performed.

      // Use originalFilename if available; otherwise fallback to newFilename.
      const originalName = fileData.originalFilename || fileData.newFilename;
      if (!originalName) {
        return res.status(400).json({ error: 'No filename provided' });
      }
      const resizedFilePath = path.join(
        process.cwd(),
        'public',
        'uploads',
        `resized_${Date.now()}${path.extname(originalName)}`
      );
      console.log("Resized file path:", resizedFilePath);
      await sharp(fileData.filepath).resize(1200, 400).toFile(resizedFilePath);
      console.log("Header image resized successfully");

      const publicUrl = await uploadFileToSupabase(
        resizedFilePath,
        resizedFilePath,
        originalName,
        session.user.id,
        "protecture/headerimage"
      );
      console.log("Public URL from Supabase:", publicUrl);
      if (!publicUrl) {
        console.log("Failed to get public URL from Supabase");
        return res.status(500).json({ error: 'Error uploading header image to Supabase' });
      }

      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: { header_img: publicUrl },
      });
      console.log("User profile updated with new header image URL");

      res.status(200).json({ fileUrl: publicUrl });
    } catch (error) {
      console.error("Error uploading or processing header image:", error);
      res.status(500).json({ error: 'Error processing header image' });
    } finally {
      if (files?.file) {
        const fileData = Array.isArray(files.file) ? files.file[0] : files.file;
        if (fileData && fs.existsSync(fileData.filepath)) {
          try {
            fs.unlinkSync(fileData.filepath);
            console.log("Original file deleted:", fileData.filepath);
          } catch (err) {
            console.error('Failed to delete original file:', fileData.filepath, err);
          }
        }
        // Attempt to remove the resized file.
        const resizedFilename = `resized_${fileData ? fileData.filename : ''}`;
        const resizedPath = path.join(
          process.cwd(),
          'public',
          'uploads',
          resizedFilename
        );
        if (fs.existsSync(resizedPath)) {
          try {
            fs.unlinkSync(resizedPath);
            console.log("Resized file deleted:", resizedPath);
          } catch (err) {
            console.error('Failed to delete resized file:', resizedPath, err);
          }
        }
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
