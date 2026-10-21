// src/app/actions/livestream/upload-thumbnail-action.ts
"use server";

import { uploadThumbnailImage } from "@/lib/images/upload-thumbnail-image";
import { auth } from "@clerk/nextjs/server";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type UploadThumbnailSuccess = {
  success: true;
  data: {
    url: string;
    key: string;
    width: number;
    height: number;
    format: string;
  };
};

type UploadThumbnailError = {
  success: false;
  error: string;
};

export type UploadThumbnailResult = UploadThumbnailSuccess | UploadThumbnailError;

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/tiff",
]);

/* -------------------------------------------------------------------------- */
/*  Upload thumbnail action                                                    */
/* -------------------------------------------------------------------------- */

export async function uploadThumbnailAction(
  formData: FormData,
): Promise<UploadThumbnailResult> {
  try {
    // -------------------------------------------------------
    // 1. Authenticate — Clerk
    // -------------------------------------------------------

    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "You must be signed in to upload a thumbnail.",
      };
    }

    // -------------------------------------------------------
    // 2. Get file from form data
    // -------------------------------------------------------

    const value = formData.get("file");

    if (!(value instanceof File)) {
      return {
        success: false,
        error: "No valid thumbnail image was provided.",
      };
    }

    // -------------------------------------------------------
    // 3. Validate size
    // -------------------------------------------------------

    if (value.size === 0) {
      return {
        success: false,
        error: "The selected thumbnail image is empty.",
      };
    }

    if (value.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Thumbnail image must be smaller than 10 MB.",
      };
    }

    // -------------------------------------------------------
    // 4. Validate MIME type
    // -------------------------------------------------------

    if (!ALLOWED_TYPES.has(value.type)) {
      return {
        success: false,
        error:
          "Unsupported thumbnail image type. Please upload JPEG, PNG, WebP, GIF, AVIF, or TIFF.",
      };
    }

    // -------------------------------------------------------
    // 5. Convert File → Buffer
    // -------------------------------------------------------

    const arrayBuffer = await value.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return {
        success: false,
        error: "The uploaded thumbnail image contains no data.",
      };
    }

    // -------------------------------------------------------
    // 6. Debug information
    // -------------------------------------------------------

    console.log("Thumbnail upload received:", {
      userId,
      name: value.name,
      type: value.type,
      size: value.size,
      bufferSize: buffer.length,
    });

    // -------------------------------------------------------
    // 7. Process + upload — namespaced under the user's id
    // -------------------------------------------------------

    const result = await uploadThumbnailImage({
      file: buffer,
      fileName: value.name,
      userId,
    });

    // -------------------------------------------------------
    // 8. Success
    // -------------------------------------------------------

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Thumbnail upload failed:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload thumbnail image. Please try again.",
    };
  }
}