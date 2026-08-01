"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { AdminField, AdminImageUploader, AdminToggle } from "@/components/admin";
import { contentService } from "@/services/content/content.service";

export type HomepagePayload = {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroImage: string;
  heroActive: boolean;
  bannerTitle?: string;
  bannerDescription?: string;
  bannerImage?: string;
  bannerCtaText?: string;
  bannerCtaLink?: string;
  bannerActive: boolean;
  featuredProductIds: string[];
  newArrivalProductIds: string[];
};

const defaults: HomepagePayload = {
  heroTitle: "Carry Confidence. Wear Elegance.",
  heroSubtitle: "The atelier collection",
  heroDescription: "Discover elevated handbags designed for modern women.",
  heroButtonText: "Discover The Collection",
  heroButtonLink: "/shop",
  heroImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  heroActive: true,
  bannerTitle: "New Season Drop",
  bannerDescription: "Limited editions now available.",
  bannerImage: "https://images.unsplash.com/photo-1555529771-835f59fc5efe",
  bannerCtaText: "Shop Now",
  bannerCtaLink: "/shop",
  bannerActive: false,
  featuredProductIds: [],
  newArrivalProductIds: [],
};

export const AdminHomepageClient = ({
  initialData,
}: {
  initialData: HomepagePayload | null;
}) => {
  const [state, setState] = useState<HomepagePayload>(initialData ?? defaults);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const payload = await contentService.getHomepageSettings();
        if (active && payload) {
          setState((prev) => ({ ...prev, ...(payload as HomepagePayload) }));
        }
      } catch {
        if (active) {
          setState((prev) => prev);
        }
      }
    };

    if (!initialData) {
      void load();
    }

    return () => {
      active = false;
    };
  }, [initialData]);

  const save = async () => {
    try {
      await contentService.updateHomepageSettings(state as Record<string, unknown>);
      setMessage("Homepage settings updated");
    } catch {
      setMessage("Update failed");
    }
  };

  return (
    <Stack spacing={2.5}>
      {message ? <Alert severity="info">{message}</Alert> : null}
      <Card sx={{ border: "1px solid #ebe2d5", boxShadow: "none", bgcolor: "#fbf8f3" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "#aa8d66" }}>
              Homepage
            </Typography>
            <Typography variant="h6" sx={{ color: "#171512" }}>
              Hero Section
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Hero Title"
                value={state.heroTitle}
                onChange={(value) => setState((prev) => ({ ...prev, heroTitle: value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Subtitle"
                value={state.heroSubtitle}
                onChange={(value) => setState((prev) => ({ ...prev, heroSubtitle: value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminField
                label="Description"
                value={state.heroDescription}
                onChange={(value) => setState((prev) => ({ ...prev, heroDescription: value }))}
                multiline
                minRows={3}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Button Text"
                value={state.heroButtonText}
                onChange={(value) => setState((prev) => ({ ...prev, heroButtonText: value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Button Link"
                value={state.heroButtonLink}
                onChange={(value) => setState((prev) => ({ ...prev, heroButtonLink: value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminField
                label="Hero Image URL"
                value={state.heroImage}
                onChange={(value) => setState((prev) => ({ ...prev, heroImage: value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminImageUploader
                label="Hero Image"
                images={state.heroImage ? [state.heroImage] : []}
                onChange={(images) => setState((prev) => ({ ...prev, heroImage: images[0] ?? "" }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminToggle
                label="Hero Active"
                checked={state.heroActive}
                onChange={(checked) => setState((prev) => ({ ...prev, heroActive: checked }))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid #ebe2d5", boxShadow: "none", bgcolor: "#fbf8f3" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "#aa8d66" }}>
              Homepage
            </Typography>
            <Typography variant="h6" sx={{ color: "#171512" }}>
              Promotional Banner
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Title"
                value={state.bannerTitle ?? ""}
                onChange={(value) => setState((prev) => ({ ...prev, bannerTitle: value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="CTA Text"
                value={state.bannerCtaText ?? ""}
                onChange={(value) => setState((prev) => ({ ...prev, bannerCtaText: value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminField
                label="Description"
                value={state.bannerDescription ?? ""}
                onChange={(value) => setState((prev) => ({ ...prev, bannerDescription: value }))}
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Banner Image URL"
                value={state.bannerImage ?? ""}
                onChange={(value) => setState((prev) => ({ ...prev, bannerImage: value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="CTA Link"
                value={state.bannerCtaLink ?? ""}
                onChange={(value) => setState((prev) => ({ ...prev, bannerCtaLink: value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminImageUploader
                label="Banner Image"
                images={state.bannerImage ? [state.bannerImage] : []}
                onChange={(images) => setState((prev) => ({ ...prev, bannerImage: images[0] ?? "" }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <AdminToggle
                label="Banner Active"
                checked={state.bannerActive}
                onChange={(checked) => setState((prev) => ({ ...prev, bannerActive: checked }))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        onClick={save}
        sx={{
          alignSelf: "flex-start",
          borderRadius: 1,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: "0.72rem",
          bgcolor: "#171512",
          "&:hover": { bgcolor: "#2d2a26" },
        }}
      >
        Save Homepage
      </Button>
    </Stack>
  );
};
