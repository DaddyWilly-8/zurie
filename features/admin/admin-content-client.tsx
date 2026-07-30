"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">About / Brand Content</Typography>
          <TextField
            label="Story"
            multiline
            minRows={3}
            value={story}
            onChange={(e) => setStory(e.target.value)}
          />
          <TextField
            label="Mission"
            multiline
            minRows={3}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
          />
          <TextField
            label="Vision"
            multiline
            minRows={3}
            value={vision}
            onChange={(e) => setVision(e.target.value)}
          />
          <TextField
            label="Quality Commitment"
            multiline
            minRows={3}
            value={qualityCommitment}
            onChange={(e) => setQualityCommitment(e.target.value)}
          />
          <Button variant="contained" onClick={saveContent}>
            Save Content
          </Button>
          {message ? <Alert severity="info">{message}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
};
