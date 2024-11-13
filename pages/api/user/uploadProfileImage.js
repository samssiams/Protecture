// /pages/api/user/uploadProfileImage.js

import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const prisma = new PrismaClient();

// Configure multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
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
    bodyParser: false, // Disable body parser to handle file uploads
  },
};

// Helper function for running middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.single('file'));
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const resizedFilePath = path.join(process.cwd(), 'public/uploads', `resized_${file.filename}`);
      await sharp(file.path).resize(300, 300).toFile(resizedFilePath);

      const profileImagePath = `/uploads/resized_${file.filename}`;
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: { profile_img: profileImagePath },
      });

      return res.status(200).json({ fileUrl: profileImagePath });
    } catch (error) {
      console.error('Error uploading or resizing profile image:', error);
      return res.status(500).json({ error: 'Error processing profile image' });
    } finally {
      // Cleanup: Delete the original file
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}