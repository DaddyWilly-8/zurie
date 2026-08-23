"use client";

import { ChangeEvent, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";

type AdminImageUploaderProps = {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  onRemoveImage?: (index: number) => void;
  fallbackUrl?: string;
  /**
   * When provided, selected files are uploaded via this function (which should
   * hit the real multipart endpoint and resolve with the persisted URL) instead
   * of being converted to a local base64 data URL.
   */
  onUpload?: (file: File) => Promise<string>;
};

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const AdminImageUploader = ({
  label = "Product Images",
  images,
  onChange,
  onRemoveImage,
  fallbackUrl = "/images/products/fallback.png",
  onUpload,
}: AdminImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewImages = images.length ? images : [fallbackUrl];

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setError(null);

    if (!onUpload) {
      const uploaded = await Promise.all(files.map((file) => toDataUrl(file)));
      onChange([...(images || []), ...uploaded]);
      return;
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        uploaded.push(await onUpload(file));
      }
      onChange([...(images || []), ...uploaded]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Typography
        variant="caption"
        sx={{
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          fontSize: "0.7rem",
          color: "text.secondary",
          fontWeight: 500,
          pl: 1.5,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        {previewImages.map((preview, index) => (
          <Box
            key={`${preview}-${index}`}
            sx={{
              width: 108,
              height: 108,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <img
              src={preview}
              alt={`${label} ${index + 1}`}
              width={108}
              height={108}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {onRemoveImage && images.length > 0 ? (
              <IconButton
                size="small"
                aria-label="Remove image"
                onClick={() => onRemoveImage(index)}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "rgba(0,0,0,0.55)",
                  color: "common.white",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                }}
              >
                <FontAwesomeIcon icon={faTrash} size="xs" />
              </IconButton>
            ) : null}
          </Box>
        ))}
        <Button
          component="label"
          variant="outlined"
          disabled={uploading}
          sx={{
            width: 108,
            height: 108,
            borderRadius: 0,
            borderStyle: "dashed",
            borderColor: "divider",
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontSize: "0.68rem",
            bgcolor: "background.default",
            flexDirection: "column",
            gap: 0.75,
          }}
        >
          {uploading ? (
            <CircularProgress size={20} />
          ) : (
            <FontAwesomeIcon icon={faUpload} />
          )}
          {uploading ? "Uploading..." : "Upload"}
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={handleFiles}
            disabled={uploading}
          />
        </Button>
      </Box>
      {error ? (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
};
