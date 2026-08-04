"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { AdminField } from "@/components/admin";
import type { ContactInfo } from "@/types/content";
import { contentService } from "@/services/content/content.service";

export const AdminSettingsClient = ({
  initial,
}: {
  initial?: ContactInfo;
}) => {
  const [whatsappNumber, setWhatsappNumber] = useState(initial?.whatsappNumber ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [instagram, setInstagram] = useState(initial?.instagram ?? "");
  const [facebook, setFacebook] = useState(initial?.facebook ?? "");
  const [tiktok, setTiktok] = useState(initial?.tiktok ?? "");
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initial?.mapEmbedUrl ?? "");
  const [message, setMessage] = useState("");

  const {
    data: settings = initial,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: contentService.getContactInfo,
    enabled: !initial,
    initialData: initial,
  });

  useEffect(() => {
    if (settings) {
      setWhatsappNumber(settings.whatsappNumber);
      setPhone(settings.phone);
      setEmail(settings.email);
      setAddress(settings.address);
      setInstagram(settings.instagram);
      setFacebook(settings.facebook);
      setTiktok(settings.tiktok);
      setMapEmbedUrl(settings.mapEmbedUrl);
    }
  }, [settings]);

  const saveSettings = async () => {
    try {
      await contentService.updateContactInfo({
        whatsappNumber,
        phone,
        email,
        address,
        instagram,
        facebook,
        tiktok,
        mapEmbedUrl,
      });
      setMessage("Settings updated");
      await refetch();
    } catch {
      setMessage("Failed to update settings");
    }
  };

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.2}>
          <Stack spacing={0.5}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>
              Settings
            </Typography>
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              Website Settings
            </Typography>
          </Stack>
          {isError ? <Alert severity="error">Failed to load settings.</Alert> : null}
          {isLoading ? <Typography color="text.secondary">Loading settings...</Typography> : null}
          <AdminField label="WhatsApp Number" value={whatsappNumber} onChange={setWhatsappNumber} />
          <AdminField label="Phone" value={phone} onChange={setPhone} />
          <AdminField label="Email" value={email} onChange={setEmail} />
          <AdminField label="Address" value={address} onChange={setAddress} />
          <AdminField label="Map Embed URL" value={mapEmbedUrl} onChange={setMapEmbedUrl} />
          <AdminField label="Instagram" value={instagram} onChange={setInstagram} />
          <AdminField label="Facebook" value={facebook} onChange={setFacebook} />
          <AdminField label="TikTok" value={tiktok} onChange={setTiktok} />
          <Button
            variant="contained"
            onClick={saveSettings}
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
            Save Settings
          </Button>
          {message ? <Alert severity="info">{message}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
};
