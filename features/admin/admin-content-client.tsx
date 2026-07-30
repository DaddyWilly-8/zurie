"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export const AdminContentClient = () => {
  const [story, setStory] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [qualityCommitment, setQualityCommitment] = useState("");
  const [message, setMessage] = useState("");

  const saveContent = async () => {
    const payload = {
      key: "brand",
      payload: {
        heroTitle: "Carry Confidence. Wear Elegance.",
        heroSubtitle:
          "Discover elevated handbags designed for modern women who move with style and purpose.",
        heroImage: "/images/hero/zurie-hero.png",
        story,
        mission,
        vision,
        qualityCommitment,
      },
    };

    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setMessage(response.ok ? "Content updated" : "Failed to update content");
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
