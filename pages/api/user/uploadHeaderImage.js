// /pages/api/user/uploadHeaderImage.js

import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { uploadFileToSupabase } from '../../../lib/supabaseHelper';

const prisma = new PrismaClient();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const validMimeTypes = ['image/jpeg', 'image/png'];
    if (!validMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG files are allowed'), false);
    }
    cb(null, true);
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.single('file'));
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Resize the header image to 1200×400
      const resizedFilePath = path.join(
        process.cwd(),
        'public',
        'uploads',
        `resized_${file.filename}`
      );
      await sharp(file.path).resize(1200, 400).toFile(resizedFilePath);

      // Upload the resized file to Supabase
      const publicUrl = await uploadFileToSupabase(
        resizedFilePath,
        resizedFilePath,
        file.originalname,
        session.user.id,
        "protecture/headerimage"
      );
      if (!publicUrl) {
        return res.status(500).json({ error: 'Error uploading header image to Supabase' });
      }

      // Update the user's profile record with the new header image URL
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: { header_img: publicUrl },
      });

      res.status(200).json({ fileUrl: publicUrl });
    } catch (error) {
      console.error('Error uploading or processing header image:', error);
      res.status(500).json({ error: 'Error processing header image' });
    } finally {
      // Cleanup: Delete both the original and resized files
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('Failed to delete original file:', req.file.path, err);
        }
      }
      const resizedPath = path.join(
        process.cwd(),
        'public',
        'uploads',
        `resized_${req.file?.filename}`
      );
      if (req.file && fs.existsSync(resizedPath)) {
        try {
          fs.unlinkSync(resizedPath);
        } catch (err) {
          console.error('Failed to delete resized file:', resizedPath, err);
        }
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
