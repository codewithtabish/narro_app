// src/lib/images/upload-thumbnail-image.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import sharp from "sharp";
import s3Client from "../clients/s3-client";

/* -------------------------------------------------------------------------- */
/*  Options                                                                    */
/* -------------------------------------------------------------------------- */

interface UploadThumbnailOptions {
  file: Buffer;
  fileName?: string;
  folder?: string;
  /** Clerk user id — used to namespace the storage path */
  userId?: string;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

// ✅ Changed to 16:9 for Live Streams
const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_HEIGHT = 720;
const THUMBNAIL_QUALITY = 80;
const DEFAULT_FOLDER = "thumbnails";

/* -------------------------------------------------------------------------- */
/*  Upload thumbnail image                                                     */
/* -------------------------------------------------------------------------- */

export async function uploadThumbnailImage({
  file,
  fileName,
  folder = process.env.AWS_S3_THUMBNAILS_FOLDER || DEFAULT_FOLDER,
  userId,
}: UploadThumbnailOptions) {
  /* ── 1. Basic buffer validation ── */
  if (!Buffer.isBuffer(file)) {
    throw new Error("Uploaded thumbnail is not a valid Buffer.");
  }
  if (file.length === 0) {
    throw new Error("Uploaded thumbnail is empty.");
  }

  /* ── 2. Verify the ORIGINAL image ── */
  let metadata;
  try {
    metadata = await sharp(file).metadata();
  } catch (error) {
    console.error("Sharp could not read thumbnail image:", error);
    throw new Error("The uploaded file is not a valid or supported image.");
  }

  if (!metadata.format || !metadata.width || !metadata.height) {
    throw new Error("Unable to detect the thumbnail image format or dimensions.");
  }

  /* ── 3. Process image (16:9 Crop + Resize) ── */
  let processedImage: Buffer;
  try {
    processedImage = await sharp(file)
      .rotate() // Respect EXIF orientation
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
        fit: "cover", // Cover the whole area without stretching
        position: "centre", // Crop from the center
      })
      .webp({
        quality: THUMBNAIL_QUALITY,
        effort: 4,
      })
      .toBuffer();
  } catch (error) {
    console.error("Thumbnail image processing failed:", error);
    throw new Error("Failed to process the thumbnail image.");
  }

  if (!processedImage || processedImage.length === 0) {
    throw new Error("Thumbnail image processing produced an empty image.");
  }

  /* ── 4. Generate unique filename ── */
  const uniqueId = randomUUID().split("-")[0];
  const cleanFileName = fileName
    ? fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "stream";

  const finalFileName = `${cleanFileName}-${uniqueId}.webp`;

  /* ── 5. S3 key (e.g. thumbnails/user_123/stream-abc.webp) ── */
  const basePath = userId ? `${folder}/${userId}` : folder;
  const key = `${basePath}/${finalFileName}`;

  /* ── 6. Upload to S3 ── */
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: processedImage,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    console.error("Thumbnail S3 upload failed:", error);
    throw new Error("Failed to upload the thumbnail image to storage.");
  }

  /* ── 7. CloudFront URL ── */
  const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL?.replace(/\/$/, "");
  if (!cloudFrontUrl) {
    throw new Error("AWS_CLOUDFRONT_URL is not configured.");
  }

  const url = `${cloudFrontUrl}/${key}`;

  /* ── 8. Return result ── */
  return {
    url,
    key,
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    format: "webp",
  };
}