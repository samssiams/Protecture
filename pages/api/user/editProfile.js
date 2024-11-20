import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const parseForm = (req) => {
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024,
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

    const { name, username } = fields;

    const userUpdateData = {};
    const profileUpdateData = {};

    if (username) userUpdateData.username = username;
    if (name) profileUpdateData.name = name;
    if (files.profile_img) {
      profileUpdateData.profile_img = `/uploads/${path.basename(files.profile_img.filepath)}`;
    }
    if (files.header_img) {
      profileUpdateData.header_img = `/uploads/${path.basename(files.header_img.filepath)}`;
    }

    await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: userUpdateData,
    });

    await prisma.userProfile.upsert({
      where: { userId: parseInt(userId, 10) },
      update: profileUpdateData,
      create: { ...profileUpdateData, userId: parseInt(userId, 10) },
    });

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
