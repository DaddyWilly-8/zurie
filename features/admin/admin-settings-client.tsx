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

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const payload = await contentService.getContactInfo();
        if (!active) return;
        setWhatsappNumber(payload.whatsappNumber);
        setPhone(payload.phone);
        setEmail(payload.email);
        setAddress(payload.address);
        setInstagram(payload.instagram);
        setFacebook(payload.facebook);
        setTiktok(payload.tiktok);
        setMapEmbedUrl(payload.mapEmbedUrl);
      } catch {
        if (active) {
          setMessage("Failed to load settings");
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
