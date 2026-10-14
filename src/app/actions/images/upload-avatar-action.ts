"use server";

import { uploadAvatarImage } from "@/lib/images/upload-avatar-image";
import { auth } from "@clerk/nextjs/server";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type UploadAvatarSuccess = {
  success: true;
  data: {
    url: string;
    key: string;
    width: number;
    height: number;
    format: string;
  };
};

type UploadAvatarError = {
  success: false;
  error: string;
};

export type UploadAvatarResult = UploadAvatarSuccess | UploadAvatarError;

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
/*  Upload avatar action                                                       */
/* -------------------------------------------------------------------------- */

export async function uploadAvatarAction(
  formData: FormData,
): Promise<UploadAvatarResult> {
  try {
    // -------------------------------------------------------
    // 1. Authenticate — Clerk
    // -------------------------------------------------------

    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "You must be signed in to upload an avatar.",
      };
    }

    // -------------------------------------------------------
    // 2. Get file from form data
    // -------------------------------------------------------

    const value = formData.get("file");

    if (!(value instanceof File)) {
      return {
        success: false,
        error: "No valid avatar image was provided.",
      };
    }

    // -------------------------------------------------------
    // 3. Validate size
    // -------------------------------------------------------

    if (value.size === 0) {
      return {
        success: false,
        error: "The selected avatar image is empty.",
      };
    }

    if (value.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Avatar image must be smaller than 10 MB.",
      };
    }

    // -------------------------------------------------------
    // 4. Validate MIME type
    // -------------------------------------------------------

    if (!ALLOWED_TYPES.has(value.type)) {
      return {
        success: false,
        error:
          "Unsupported avatar image type. Please upload JPEG, PNG, WebP, GIF, AVIF, or TIFF.",
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
        error: "The uploaded avatar image contains no data.",
      };
    }

    // -------------------------------------------------------
    // 6. Debug information
    // -------------------------------------------------------

    console.log("Avatar upload received:", {
      userId,
      name: value.name,
      type: value.type,
      size: value.size,
      bufferSize: buffer.length,
    });

    // -------------------------------------------------------
    // 7. Process + upload — namespaced under the user's id
    // -------------------------------------------------------

    const result = await uploadAvatarImage({
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
    console.error("Avatar upload failed:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload avatar image. Please try again.",
    };
  }
}