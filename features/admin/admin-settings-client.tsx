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

export const AdminSettingsClient = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("254718752434");
  const [phone, setPhone] = useState("+254 718 752 434");
  const [email, setEmail] = useState("hello@zurie.co.tz");
  const [address, setAddress] = useState("Nairobi, Kenya");
  const [instagram, setInstagram] = useState("https://instagram.com");
  const [facebook, setFacebook] = useState("https://facebook.com");
  const [tiktok, setTiktok] = useState("https://tiktok.com");
  const [mapEmbedUrl, setMapEmbedUrl] = useState(
    "https://maps.google.com/maps?q=Nairobi&t=&z=13&ie=UTF8&iwloc=&output=embed",
  );
  const [message, setMessage] = useState("");

  const saveSettings = async () => {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "contact",
        value: {
          whatsappNumber,
          phone,
          email,
          address,
          instagram,
          facebook,
          tiktok,
          mapEmbedUrl,
        },
      }),
    });

    setMessage(response.ok ? "Settings updated" : "Failed to update settings");
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
