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
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Website Settings</Typography>
          <TextField
            label="WhatsApp Number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <TextField
            label="Map Embed URL"
            value={mapEmbedUrl}
            onChange={(e) => setMapEmbedUrl(e.target.value)}
          />
          <TextField
            label="Instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
          <TextField
            label="Facebook"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
          />
          <TextField
            label="TikTok"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
          />
          <Button variant="contained" onClick={saveSettings}>
            Save Settings
          </Button>
          {message ? <Alert severity="info">{message}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
};
