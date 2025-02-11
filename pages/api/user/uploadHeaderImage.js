// pages/api/user/uploadHeaderImage.js
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

// Helper to parse incoming form data using formidable
const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  console.log('UploadHeaderImage API called');

  const session = await getServerSession(req, res, authOptions);
  console.log('Session:', session);
  if (!session || !session.user) {
    console.log('Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { files } = await parseForm(req);
      const file = files.file;
      console.log('Uploaded file info:', file);
      if (!file) {
        console.log('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validate file type
      const validMimeTypes = ['image/jpeg', 'image/png'];
      if (!validMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Only JPEG and PNG files are allowed' });
      }

      // Resize the header image to 1200×400
      const resizedFilePath = path.join(
        process.cwd(),
        'public',
        'uploads',
        `resized_${Date.now()}${path.extname(file.originalFilename)}`
      );
      console.log('Resized file path:', resizedFilePath);
      await sharp(file.filepath).resize(1200, 400).toFile(resizedFilePath);
      console.log('Header image resized successfully');

      // Upload the resized file to Supabase
      const publicUrl = await uploadFileToSupabase(
        resizedFilePath,
        resizedFilePath,
        file.originalFilename,
        session.user.id,
        'protecture/headerimage'
      );
      console.log('Public URL from Supabase:', publicUrl);
      if (!publicUrl) {
        console.log('Failed to get public URL from Supabase');
        return res.status(500).json({ error: 'Error uploading header image to Supabase' });
      }

      // Update the user's profile with the new header image URL
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: { header_img: publicUrl },
      });
      console.log('User profile updated with new header image URL');

      // Cleanup: Delete temporary files
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
        console.log('Original file deleted:', file.filepath);
      }
      if (fs.existsSync(resizedFilePath)) {
        fs.unlinkSync(resizedFilePath);
        console.log('Resized file deleted:', resizedFilePath);
      }

      res.status(200).json({ fileUrl: publicUrl });
    } catch (error) {
      console.error('Error uploading or processing header image:', error);
      res.status(500).json({ error: 'Error processing header image' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
