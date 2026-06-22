"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = { "image/jpeg": [], "image/png": [], "image/webp": [] };

export default function UploadZone({ onFile, disabled }: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB — matches backend limit
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        flex flex-col items-center justify-center gap-3
        border-2 border-dashed rounded-2xl
        px-8 py-16 cursor-pointer transition-colors
        ${isDragActive
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
        }
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <input {...getInputProps()} />
      <span className="text-4xl">📷</span>
      <p className="text-center text-gray-600 text-sm leading-relaxed">
        {isDragActive
          ? "Drop your fridge photo here…"
          : "Drag & drop a fridge photo, or click to browse"}
      </p>
      <p className="text-xs text-gray-400">JPEG, PNG, or WebP · max 10 MB</p>
    </div>
  );
}
