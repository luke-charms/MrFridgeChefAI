"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// Accepted file types and max size must match backend validation
const ACCEPTED_TYPES = { "image/jpeg": [], "image/png": [], "image/webp": [] };
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB — must match backend

export default function UploadZone({ onFile, disabled }) {
  // State to hold the rejection message, if any
  const [rejection, setRejection] = useState(null);

  // Callback for handling file drops
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      // Clear any previous rejection message on a new drop attempt
      setRejection(null);

      if (rejectedFiles.length > 0) {
        // Get the error code from the first rejected file
        const code = rejectedFiles[0].errors[0]?.code;
        const messages = {
          "file-invalid-type": "Only JPEG, PNG, or WebP images are accepted.",
          "file-too-large": "File is too large. Maximum size is 10 MB.",
          "too-many-files": "Please upload one photo at a time.",
        };
        setRejection(messages[code] ?? "File rejected. Please try another.");
        return;
      }

      // If a file is accepted, call the onFile callback with the first accepted file
      if (acceptedFiles[0]) {
        onFile(acceptedFiles[0]);
      }
    },
    [onFile]
  );

  // Set up the dropzone with the specified options
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_SIZE_BYTES,
    disabled,
  });

  return (
    <div className="flex flex-col gap-3">
      {/* getRootProps connects this div to the drag-and-drop events */}
      <div
        {...getRootProps()}
        className={`
          flex flex-col items-center justify-center gap-3
          border-2 border-dashed rounded-2xl
          px-8 py-16 cursor-pointer transition-colors
          ${isDragActive
            ? "border-emerald-500 bg-emerald-50"
            : rejection
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
          }
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />
        <span className="text-4xl">{rejection ? "⚠️" : "📷"}</span>
        <p className="text-center text-gray-600 text-sm leading-relaxed">
          {isDragActive
            ? "Drop your fridge photo here…"
            : "Drag & drop a fridge photo, or click to browse"}
        </p>
        <p className="text-xs text-gray-400">JPEG, PNG, or WebP · max 10 MB</p>
      </div>

      {/* The rejection message is rendered outside the drop zone to prevent
          the main upload box from jumping or resizing when an error occurs */}
      {rejection && (
        <p className="text-sm text-red-600 px-1">{rejection}</p>
      )}
    </div>
  );
}
