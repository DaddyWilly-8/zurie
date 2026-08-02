"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { AdminField, AdminImageUploader } from "@/components/admin";
import type { BrandContent } from "@/types/content";
import { contentService } from "@/services/content/content.service";

export const AdminContentClient = ({
  initial,
}: {
  initial?: BrandContent;
}) => {
  const [story, setStory] = useState(initial?.story ?? "");
  const [mission, setMission] = useState(initial?.mission ?? "");
  const [vision, setVision] = useState(initial?.vision ?? "");
  const [qualityCommitment, setQualityCommitment] = useState(
    initial?.qualityCommitment ?? "",
  );
  const [heroImage, setHeroImage] = useState(initial?.heroImage ?? "/images/hero/zurie-hero.png");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const payload = await contentService.getBrandContent();
        if (!active) return;
        setStory(payload.story);
        setMission(payload.mission);
        setVision(payload.vision);
        setQualityCommitment(payload.qualityCommitment);
        setHeroImage(payload.heroImage);
      } catch {
        if (active) {
          setMessage("Failed to load content");
        }
      }
    };

    if (!initial) {
      void load();
    }

    return () => {
      active = false;
    };
  }, [initial]);

  const saveContent = async () => {
    const payload = {
      key: "brand",
      payload: {
        heroTitle: "Carry Confidence. Wear Elegance.",
        heroSubtitle:
          "Discover elevated handbags designed for modern women who move with style and purpose.",
        heroImage,
        story,
        mission,
        vision,
        qualityCommitment,
      },
    };

    try {
      await contentService.updateBrandContent(payload.payload);
      setMessage("Content updated");
    } catch {
      setMessage("Failed to update content");
    }
  };

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.2}>
          <Stack spacing={0.5}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>
              Content
            </Typography>
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              About / Brand Content
            </Typography>
          </Stack>
          <AdminField label="Story" value={story} onChange={setStory} multiline minRows={3} />
          <AdminField label="Mission" value={mission} onChange={setMission} multiline minRows={3} />
          <AdminField label="Vision" value={vision} onChange={setVision} multiline minRows={3} />
          <AdminField
            label="Quality Commitment"
            value={qualityCommitment}
            onChange={setQualityCommitment}
            multiline
            minRows={3}
          />
          <AdminField label="Hero Image URL" value={heroImage} onChange={setHeroImage} />
          <AdminImageUploader
            label="Hero Image"
            images={heroImage ? [heroImage] : []}
            onChange={(images) => setHeroImage(images[0] ?? "")}
          />
          <Button
            variant="contained"
            onClick={saveContent}
            sx={{
              alignSelf: "flex-start",
              borderRadius: 1,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "0.72rem",
              bgcolor: "text.primary",
              "&:hover": { bgcolor: "text.secondary" },
            }}
          >
            Save Content
          </Button>
          {message ? <Alert severity="info">{message}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
};
