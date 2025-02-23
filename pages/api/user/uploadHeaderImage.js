import prisma from "../../../lib/prisma";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import os from 'os';
import sharp from 'sharp';
import { uploadFileToSupabase } from '../../../lib/supabaseHelper';


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
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    let files;
    let resizedFilePath; // store the temp path so we can clean it up later
    try {
      ({ files } = await parseForm(req));
      let file = files.file;
      const fileData = Array.isArray(file) ? file[0] : file;
      if (!fileData) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const originalName = fileData.originalFilename || fileData.newFilename;
      if (!originalName) {
        return res.status(400).json({ error: 'No filename provided' });
      }
      // Use system temporary folder instead of public/uploads
      resizedFilePath = path.join(
        os.tmpdir(),
        `resized_${Date.now()}${path.extname(originalName)}`
      );
      await sharp(fileData.filepath).resize(1200, 400).toFile(resizedFilePath);
      const publicUrl = await uploadFileToSupabase(
        resizedFilePath,
        resizedFilePath,
        originalName,
        session.user.id,
        'protecture/headerimage'
      );
      if (!publicUrl) {
        return res.status(500).json({ error: 'Error uploading header image to Supabase' });
      }

      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: { header_img: publicUrl },
      });

      res.status(200).json({ fileUrl: publicUrl });
    } catch (error) {
      console.error('Error uploading or processing header image:', error);
      res.status(500).json({ error: 'Error processing header image' });
    } finally {
      // Delete temporary original file from formidable
      if (files?.file) {
        const fileData = Array.isArray(files.file) ? files.file[0] : files.file;
        if (fileData && fs.existsSync(fileData.filepath)) {
          try {
            fs.unlinkSync(fileData.filepath);
          } catch (err) {
            console.error('Failed to delete original file:', fileData.filepath, err);
          }
        }
      }
      // Delete the resized temporary file
      if (resizedFilePath && fs.existsSync(resizedFilePath)) {
        try {
          fs.unlinkSync(resizedFilePath);
        } catch (err) {
          console.error('Failed to delete resized file:', resizedFilePath, err);
        }
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
