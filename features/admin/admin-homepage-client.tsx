"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
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
    <Stack spacing={2}>
      {message ? <Alert severity="info">{message}</Alert> : null}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Hero Section
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Hero Title"
                value={state.heroTitle}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, heroTitle: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Subtitle"
                value={state.heroSubtitle}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, heroSubtitle: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                value={state.heroDescription}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, heroDescription: event.target.value }))
                }
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Button Text"
                value={state.heroButtonText}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, heroButtonText: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Button Link"
                value={state.heroButtonLink}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, heroButtonLink: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Hero Image URL"
                value={state.heroImage}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, heroImage: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={state.heroActive}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, heroActive: event.target.checked }))
                  }
                />
                <Typography>Hero Active</Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Promotional Banner
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Title"
                value={state.bannerTitle ?? ""}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, bannerTitle: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="CTA Text"
                value={state.bannerCtaText ?? ""}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, bannerCtaText: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                value={state.bannerDescription ?? ""}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, bannerDescription: event.target.value }))
                }
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Banner Image URL"
                value={state.bannerImage ?? ""}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, bannerImage: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="CTA Link"
                value={state.bannerCtaLink ?? ""}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, bannerCtaLink: event.target.value }))
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={state.bannerActive}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, bannerActive: event.target.checked }))
                  }
                />
                <Typography>Banner Active</Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Button variant="contained" onClick={save}>
        Save Homepage
      </Button>
    </Stack>
  );
};
