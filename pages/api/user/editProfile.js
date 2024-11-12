import { PrismaClient } from '@prisma/client'; // Assuming you're using Prisma for database
import formidable from 'formidable';
import path from 'path';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing for handling multipart form-data
  },
};

// Helper function to parse form-data
const parseForm = (req) => {
  const form = formidable({
    uploadDir: path.join(process.cwd(), '/public/uploads'), // Adjust path as needed
    keepExtensions: true,
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

  try {
    // Parse the incoming form data (fields and files)
    const { fields, files } = await parseForm(req);
    console.log("Received fields:", fields); // Log incoming fields to see if they are correct
    console.log("Received files:", files);   // Log incoming files

    // Extract profile data from the request
    const { userId, name, username, profileImageUrl, headerImageUrl } = fields;

    // Ensure userId is provided in the fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Handle profile image upload
    let updatedProfileImageUrl = profileImageUrl;
    if (files.profile_img) {
      const file = files.profile_img;
      const newPath = path.join('/uploads', path.basename(file.filepath));
      updatedProfileImageUrl = newPath;
    }

    // Handle header image upload
    let updatedHeaderImageUrl = headerImageUrl;
    if (files.header_img) {
      const file = files.header_img;
      const newPath = path.join('/uploads', path.basename(file.filepath));
      updatedHeaderImageUrl = newPath;
    }

    // Attempt to update user profile in the database
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: {
        username: username || undefined,
        profile: {
          upsert: {
            create: {
              userId: parseInt(userId, 10),
              name: name || undefined,
              profile_img: updatedProfileImageUrl || undefined,
              header_img: updatedHeaderImageUrl || undefined,
            },
            update: {
              name: name || undefined,
              profile_img: updatedProfileImageUrl || undefined,
              header_img: updatedHeaderImageUrl || undefined,
            },
          },
        },
      },
      include: {
        profile: true, // Include updated profile data in the response
      },
    });

    // Return successful response with the updated user data
    return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error); // Log any errors that occur
    return res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
}
