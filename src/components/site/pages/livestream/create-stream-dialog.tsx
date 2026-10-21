// src/components/livestream/create-stream-dialog.tsx
"use client";

import { uploadThumbnailAction } from "@/app/actions/images/upload-thumbnail-action";
import { createLiveStream } from "@/app/actions/livestream/create-stream";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function CreateStreamDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // ✅ State for the image
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // ✅ State for the form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // ✅ 1. Handle Image Selection & Upload Immediately
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await uploadThumbnailAction(formData);
      
      if (!res.success) throw new Error(res.error);
      
      // Success! Save the S3 URL
      setUploadedImageUrl(res.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ 2. Handle Form Submission
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !uploadedImageUrl || isSubmitting || isUploadingImage) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createLiveStream({
        title,
        description,
        thumbnailUrl: uploadedImageUrl,
      });
      
      if (!res.success) throw new Error(res.error);

      router.push(`/live-stream/active/${res.streamId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start stream.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-4 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isSubmitting && !isUploadingImage ? onClose : undefined}
      />

      <div className="relative w-full max-w-lg rounded-[32px] bg-background shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between p-6 pb-0 sm:p-8 sticky top-0 bg-background z-20">
          <div>
            <h2 className="font-serif text-[28px] text-foreground">Go Live</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up your stream and start broadcasting.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting || isUploadingImage}
            className="rounded-full p-2 hover:bg-muted disabled:opacity-50"
            type="button"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleStart} className="flex flex-col gap-5 p-6 sm:p-8">
          
          {/* ── COVER IMAGE UPLOAD ── */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Cover Image (Required)
            </label>
            
            {/* ✅ FIXED HEIGHT CONTAINER */}
            <div className="relative w-full min-h-[220px] overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
              
              {/* 1. Uploading State */}
              {isUploadingImage && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-[#6B4A3A]" />
                  <span className="mt-2 text-sm font-medium text-foreground">Uploading image...</span>
                </div>
              )}

              {/* 2. Image Preview State */}
              {uploadedImageUrl && !isUploadingImage ? (
                <>
                  <Image
                    src={uploadedImageUrl}
                    alt="Stream cover preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-2 text-white shadow-sm transition-colors hover:bg-black/80 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : !isUploadingImage ? (
                /* 3. Empty State */
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 p-6 text-muted-foreground transition-colors hover:text-foreground">
                  <div className="rounded-full bg-muted p-3">
                    <ImagePlus size={24} />
                  </div>
                  <span className="text-sm font-medium">Click to upload cover image</span>
                  <span className="text-xs text-muted-foreground">JPEG, PNG, WebP up to 10MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={isSubmitting}
                  />
                </label>
              ) : null}
            </div>
          </div>

          {/* ── TITLE ── */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Stream Title (Required)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., English Practice with Emma"
              required
              maxLength={100}
              disabled={isSubmitting || isUploadingImage}
              className="h-12 w-full rounded-xl border border-border bg-background px-4 text-[15px] outline-none focus:border-[#6B4A3A] focus:ring-1 focus:ring-[#6B4A3A] disabled:opacity-50"
            />
          </div>

          {/* ── DESCRIPTION ── */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Description (Required)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you talking about today?"
              required
              rows={3}
              maxLength={200}
              disabled={isSubmitting || isUploadingImage}
              className="w-full resize-none rounded-xl border border-border bg-background p-4 text-[15px] outline-none focus:border-[#6B4A3A] focus:ring-1 focus:ring-[#6B4A3A] disabled:opacity-50"
            />
          </div>

          {/* ── ERROR ── */}
          {error && (
            <p className="text-center text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          {/* ── SUBMIT BUTTON ── */}
          <button
            type="submit"
            disabled={
              !title.trim() ||
              !description.trim() ||
              !uploadedImageUrl ||
              isSubmitting ||
              isUploadingImage
            }
            className="mt-2 flex h-12 items-center justify-center gap-2 rounded-full bg-[#6B4A3A] text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-[#5a3f31] active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Starting Broadcast...
              </>
            ) : (
              "🔴 Start Broadcast"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}