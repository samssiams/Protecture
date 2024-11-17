import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

// Use the anonymous key for Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Uploads a file to Supabase storage and returns the public URL.
 *
 * @param {Object} file - The file to be uploaded.
 * @param {string} filepath - Path to the file.
 * @param {string} originalFilename - Original name of the file.
 * @param {string} uniqueId - Unique identifier for the file.
 * @param {string} bucketPath - Path to the Supabase storage bucket.
 * @returns {Promise<string|null>} Public URL of the uploaded file or null if an error occurs.
 */
export async function uploadFileToSupabase(file, filepath, originalFilename, uniqueId, bucketPath) {
  if (!file || !filepath || !originalFilename || !uniqueId || !bucketPath) {
    console.error("Invalid file or parameters provided");
    return null;
  }

  // Extract the file extension and create a unique filename
  const fileExt = originalFilename.split(".").pop();
  const fileName = `${uniqueId}-${uuidv4()}.${fileExt}`;

  try {
    // Read the file content into a buffer
    const fileContent = fs.readFileSync(filepath);

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketPath)
      .upload(fileName, fileContent, {
        cacheControl: "3600", // Cache for 1 hour
        upsert: false,        // Prevent overwriting
      });

    if (error) {
      // Handle specific row-level security policy error
      if (error.message.includes("row-level security policy")) {
        console.error(
          "Row-level security policy error: Ensure your bucket allows authenticated insert permissions."
        );
      }
      console.error("Failed to upload file to Supabase:", error.message);
      return null;
    }

    // Verify if the upload succeeded and generate the public URL
    const publicURL = supabase.storage
      .from(bucketPath)
      .getPublicUrl(fileName)?.data?.publicUrl;

    if (!publicURL) {
      console.error("Failed to generate public URL for the file.");
      return null;
    }

    console.log("File uploaded successfully:", publicURL);

    return publicURL;
  } catch (err) {
    console.error("Error reading or uploading file:", err.message);
    return null;
  }
}
