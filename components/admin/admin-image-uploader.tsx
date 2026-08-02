"use client";

import Image from "next/image";
import { ChangeEvent } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

type AdminImageUploaderProps = {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  fallbackUrl?: string;
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
  fallbackUrl = "/images/products/fallback.png",
}: AdminImageUploaderProps) => {
  const preview = images[0] || fallbackUrl;

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const uploaded = await Promise.all(files.map((file) => toDataUrl(file)));
    onChange([...(images || []), ...uploaded]);
    event.target.value = "";
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Box
          sx={{
            width: 108,
            height: 108,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Image
            src={preview}
            alt={label}
            width={108}
            height={108}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
        <Button
          component="label"
          variant="outlined"
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
          <FontAwesomeIcon icon={faUpload} />
          Upload
          <input hidden type="file" accept="image/*" onChange={handleFiles} />
        </Button>
      </Box>
    </Stack>
  );
};
