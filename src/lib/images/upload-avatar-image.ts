import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import sharp from "sharp";
import s3Client from "../clients/s3-client";

/* -------------------------------------------------------------------------- */
/*  Options                                                                    */
/* -------------------------------------------------------------------------- */

interface UploadAvatarOptions {
  file: Buffer;
  fileName?: string;
  folder?: string;
  /** Clerk user id — used to namespace the storage path */
  userId?: string;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const AVATAR_SIZE = 512; // square, in pixels
const AVATAR_QUALITY = 88;
const DEFAULT_FOLDER = "avatars";

/* -------------------------------------------------------------------------- */
/*  Upload avatar image                                                        */
/* -------------------------------------------------------------------------- */

export async function uploadAvatarImage({
  file,
  fileName,
  folder = process.env.AWS_S3_AVATARS_FOLDER || DEFAULT_FOLDER,
  userId,
}: UploadAvatarOptions) {
  // ---------------------------------------------------------
  // 1. Basic buffer validation
  // ---------------------------------------------------------

  if (!Buffer.isBuffer(file)) {
    throw new Error("Uploaded avatar is not a valid Buffer.");
  }

  if (file.length === 0) {
    throw new Error("Uploaded avatar is empty.");
  }

  // ---------------------------------------------------------
  // 2. Verify the ORIGINAL image
  // ---------------------------------------------------------

  let metadata;

  try {
    metadata = await sharp(file).metadata();
  } catch (error) {
    console.error("Sharp could not read avatar image:", error);
    throw new Error("The uploaded file is not a valid or supported image.");
  }

  if (!metadata.format) {
    throw new Error("Unable to detect the avatar image format.");
  }

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to detect the avatar image dimensions.");
  }

  console.log("Avatar image detected:", {
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    size: file.length,
  });

  // ---------------------------------------------------------
  // 3. Process image
  //
  // Square crop from the CENTER, resized to 512×512.
  // No SVG/composite — keeps libvips happy (same as banner).
  // ---------------------------------------------------------

  let processedImage: Buffer;

  try {
    processedImage = await sharp(file)
      // Respect EXIF orientation
      .rotate()

      // Square avatar — cover fit, center crop
      .resize(AVATAR_SIZE, AVATAR_SIZE, {
        fit: "cover",
        position: "centre",
      })

      // Optimized WebP
      .webp({
        quality: AVATAR_QUALITY,
        effort: 4,
      })

      .toBuffer();
  } catch (error) {
    console.error("Avatar image processing failed:", error);
    throw new Error("Failed to process the avatar image.");
  }

  if (!processedImage || processedImage.length === 0) {
    throw new Error("Avatar image processing produced an empty image.");
  }

  // ---------------------------------------------------------
  // 4. Generate unique filename
  // ---------------------------------------------------------

  const uniqueId = randomUUID().split("-")[0];

  const cleanFileName = fileName
    ? fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "avatar";

  const finalFileName = `${cleanFileName}-${uniqueId}.webp`;

  // ---------------------------------------------------------
  // 5. S3 key
  //
  // If a userId is provided, nest the avatar under that user:
  //   avatars/{userId}/avatar-xxxx.webp
  // Otherwise:
  //   avatars/avatar-xxxx.webp
  // ---------------------------------------------------------

  const basePath = userId ? `${folder}/${userId}` : folder;
  const key = `${basePath}/${finalFileName}`;

  // ---------------------------------------------------------
  // 6. Upload to S3
  // ---------------------------------------------------------

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: processedImage,
        ContentType: "image/webp",

        /*
         * Avatars are immutable because every upload gets
         * a unique filename. Safe to cache forever.
         */
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    console.error("Avatar S3 upload failed:", error);
    throw new Error("Failed to upload the avatar image to storage.");
  }

  // ---------------------------------------------------------
  // 7. CloudFront URL
  // ---------------------------------------------------------

  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL?.replace(/\/$/, "");

  if (!cloudFrontUrl) {
    throw new Error("AWS_CLOUDFRONT_URL is not configured.");
  }

  const url = `${cloudFrontUrl}/${key}`;

  // ---------------------------------------------------------
  // 8. Return result
  // ---------------------------------------------------------

  return {
    url,
    key,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    format: "webp",
  };
}