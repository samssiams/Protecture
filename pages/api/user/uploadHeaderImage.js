import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
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
  console.log("UploadHeaderImage API called");

  // Use getServerSession to properly read the session on the server
  const session = await getServerSession(req, res, authOptions);
  console.log("Session:", session);
  if (!session || !session.user) {
    console.log("Unauthorized access attempt");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.single('file'));
      console.log("Multer middleware completed");
      const file = req.file;
      console.log("Uploaded file info:", file);
      if (!file) {
        console.log("No file uploaded");
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Resize the header image to 1200×400
      const resizedFilePath = path.join(
        process.cwd(),
        'public',
        'uploads',
        `resized_${file.filename}`
      );
      console.log("Resized file path:", resizedFilePath);
      await sharp(file.path).resize(1200, 400).toFile(resizedFilePath);
      console.log("Header image resized successfully");

      // Upload the resized file to Supabase
      const publicUrl = await uploadFileToSupabase(
        resizedFilePath,
        resizedFilePath,
        file.originalname,
        session.user.id,
        "protecture/headerimage"
      );
      console.log("Public URL from Supabase:", publicUrl);
      if (!publicUrl) {
        console.log("Failed to get public URL from Supabase");
        return res.status(500).json({ error: 'Error uploading header image to Supabase' });
      }

      // Update the user's profile record with the new header image URL
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: { header_img: publicUrl },
      });
      console.log("User profile updated with new header image URL");

      res.status(200).json({ fileUrl: publicUrl });
    } catch (error) {
      console.error('Error uploading or processing header image:', error);
      res.status(500).json({ error: 'Error processing header image' });
    } finally {
      // Cleanup: Delete both the original and resized files
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          console.log("Original file deleted:", req.file.path);
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
          console.log("Resized file deleted:", resizedPath);
        } catch (err) {
          console.error('Failed to delete resized file:', resizedPath, err);
        }
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
