"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import {
  AdminField,
  AdminFeedbackSnackbar,
  AdminImageUploader,
} from "@/components/admin";
import { contentService } from "@/services/content/content.service";
import { useSiteSettings } from "@/providers/settings-provider";
import type {
  BrandSettings,
  ContactSettings,
  HomepageSettings,
  PoliciesSettings,
} from "@/types/content";

type ActiveTab = "brand" | "contact" | "homepage" | "policies";

const emptyContact: ContactSettings = {
  phones: [],
  emails: [],
  socialLinks: [],
};
const emptyBrand: BrandSettings = { siteName: "", tagline: "" };
const emptyHomepage: HomepageSettings = {
  heroHeading: "",
  heroSubheading: "",
  heroCtaText: "",
  heroCtaUrl: "",
};
const emptyPolicies: PoliciesSettings = {
  deliveryPolicy: "",
  returnPolicy: "",
};

export const AdminSettingsClient = () => {
  const { refreshSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<ActiveTab>("brand");

  const [brand, setBrand] = useState<BrandSettings>(emptyBrand);
  const [contact, setContact] = useState<ContactSettings>(emptyContact);
  const [homepage, setHomepage] = useState<HomepageSettings>(emptyHomepage);
  const [policies, setPolicies] = useState<PoliciesSettings>(emptyPolicies);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info",
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [brandData, contactData, homepageData, policiesData] =
          await Promise.all([
            contentService.getBrandSettings(),
            contentService.getContactSettings(),
            contentService.getHomepageSettings(),
            contentService.getPoliciesSettings(),
          ]);
        setBrand(brandData);
        setContact(contactData);
        setHomepage(homepageData);
        setPolicies(policiesData);
      } catch {
        setMessage("Failed to load settings.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const afterSave = async (label: string) => {
    setMessage(`${label} saved successfully.`);
    setMessageType("success");
    await refreshSettings();
  };

  const saveBrand = async () => {
    setSaving(true);
    try {
      const updated = await contentService.updateBrandSettings({
        siteName: brand.siteName,
        tagline: brand.tagline,
      });
      setBrand(updated);
      await afterSave("Brand settings");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save brand settings.",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const saveContact = async () => {
    setSaving(true);
    try {
      await contentService.updateContactSettings(contact);
      await afterSave("Contact settings");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save contact settings.",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const saveHomepage = async () => {
    setSaving(true);
    try {
      await contentService.updateHomepageSettings({
        heroHeading: homepage.heroHeading,
        heroSubheading: homepage.heroSubheading,
        heroCtaText: homepage.heroCtaText,
        heroCtaUrl: homepage.heroCtaUrl,
      });
      await afterSave("Homepage settings");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save homepage settings.",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const savePolicies = async () => {
    setSaving(true);
    try {
      await contentService.updatePoliciesSettings(policies);
      await afterSave("Policies");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save policies.",
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (activeTab === "brand") void saveBrand();
    else if (activeTab === "contact") void saveContact();
    else if (activeTab === "homepage") void saveHomepage();
    else void savePolicies();
  };

  const uploadLogo = async (file: File) => {
    const updated = await contentService.uploadBrandLogo(file);
    setBrand(updated);
    return updated.logoUrl ?? "";
  };

  const uploadHeroImage = async (file: File) => {
    const updated = await contentService.uploadHomepageHeroImage(file);
    setHomepage(updated);
    return updated.heroImageUrl ?? "";
  };

  const addPhone = () =>
    setContact((prev) => ({
      ...prev,
      phones: [...prev.phones, { label: "", value: "" }],
    }));
  const removePhone = (index: number) =>
    setContact((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index),
    }));
  const updatePhone = (index: number, key: "label" | "value", value: string) =>
    setContact((prev) => ({
      ...prev,
      phones: prev.phones.map((p, i) =>
        i === index ? { ...p, [key]: value } : p,
      ),
    }));

  const addEmail = () =>
    setContact((prev) => ({
      ...prev,
      emails: [...prev.emails, { label: "", value: "" }],
    }));
  const removeEmail = (index: number) =>
    setContact((prev) => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index),
    }));
  const updateEmail = (index: number, key: "label" | "value", value: string) =>
    setContact((prev) => ({
      ...prev,
      emails: prev.emails.map((e, i) =>
        i === index ? { ...e, [key]: value } : e,
      ),
    }));

  const addSocialLink = () =>
    setContact((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "" }],
    }));
  const removeSocialLink = (index: number) =>
    setContact((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  const updateSocialLink = (
    index: number,
    key: "platform" | "url",
    value: string,
  ) =>
    setContact((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s, i) =>
        i === index ? { ...s, [key]: value } : s,
      ),
    }));

  const sectionTitle =
    activeTab === "brand"
      ? "Brand"
      : activeTab === "contact"
        ? "Contact Info"
        : activeTab === "homepage"
          ? "Homepage"
          : "Policies";

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography
              variant="overline"
              sx={{ letterSpacing: "0.24em", color: "primary.main" }}
            >
              Settings
            </Typography>
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              Website Settings
            </Typography>
          </Stack>

          <Tabs
            value={activeTab}
            onChange={(_, value: ActiveTab) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab value="brand" label="Brand" />
            <Tab value="contact" label="Contact" />
            <Tab value="homepage" label="Homepage" />
            <Tab value="policies" label="Policies" />
          </Tabs>

          {loading ? (
            <Typography
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
            >
              Loading settings...
            </Typography>
          ) : (
            <>
              {activeTab === "brand" && (
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <AdminField
                      label="Site Name"
                      value={brand.siteName}
                      onChange={(v) =>
                        setBrand((prev) => ({ ...prev, siteName: v }))
                      }
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <AdminField
                      label="Tagline"
                      value={brand.tagline}
                      onChange={(v) =>
                        setBrand((prev) => ({ ...prev, tagline: v }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <AdminImageUploader
                      label="Logo"
                      images={brand.logoUrl ? [brand.logoUrl] : []}
                      onChange={(images) =>
                        setBrand((prev) => ({
                          ...prev,
                          logoUrl: images[0] ?? prev.logoUrl,
                        }))
                      }
                      onUpload={uploadLogo}
                    />
                  </Grid>
                </Grid>
              )}

              {activeTab === "contact" && (
                <Stack spacing={3}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Phone Numbers
                    </Typography>
                    {contact.phones.map((phone, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <AdminField
                          label="Label"
                          value={phone.label}
                          onChange={(v) => updatePhone(index, "label", v)}
                        />
                        <AdminField
                          label="Number"
                          value={phone.value}
                          onChange={(v) => updatePhone(index, "value", v)}
                        />
                        <IconButton
                          onClick={() => removePhone(index)}
                          aria-label="Remove phone"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addPhone}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      Add Phone
                    </Button>
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Email Addresses
                    </Typography>
                    {contact.emails.map((email, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <AdminField
                          label="Label"
                          value={email.label}
                          onChange={(v) => updateEmail(index, "label", v)}
                        />
                        <AdminField
                          label="Email"
                          value={email.value}
                          onChange={(v) => updateEmail(index, "value", v)}
                        />
                        <IconButton
                          onClick={() => removeEmail(index)}
                          aria-label="Remove email"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addEmail}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      Add Email
                    </Button>
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Social Links
                    </Typography>
                    {contact.socialLinks.map((social, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <AdminField
                          label="Platform"
                          value={social.platform}
                          onChange={(v) =>
                            updateSocialLink(index, "platform", v)
                          }
                          placeholder="instagram"
                        />
                        <AdminField
                          label="URL"
                          value={social.url}
                          onChange={(v) => updateSocialLink(index, "url", v)}
                        />
                        <IconButton
                          onClick={() => removeSocialLink(index)}
                          aria-label="Remove social link"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addSocialLink}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      Add Social Link
                    </Button>
                  </Stack>
                </Stack>
              )}

              {activeTab === "homepage" && (
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <AdminField
                      label="Hero Heading"
                      value={homepage.heroHeading}
                      onChange={(v) =>
                        setHomepage((prev) => ({ ...prev, heroHeading: v }))
                      }
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <AdminField
                      label="Hero Subheading"
                      value={homepage.heroSubheading}
                      onChange={(v) =>
                        setHomepage((prev) => ({ ...prev, heroSubheading: v }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <AdminField
                      label="CTA Text"
                      value={homepage.heroCtaText}
                      onChange={(v) =>
                        setHomepage((prev) => ({ ...prev, heroCtaText: v }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <AdminField
                      label="CTA URL"
                      value={homepage.heroCtaUrl}
                      onChange={(v) =>
                        setHomepage((prev) => ({ ...prev, heroCtaUrl: v }))
                      }
                      placeholder="/shop"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <AdminImageUploader
                      label="Hero Image"
                      images={
                        homepage.heroImageUrl ? [homepage.heroImageUrl] : []
                      }
                      onChange={(images) =>
                        setHomepage((prev) => ({
                          ...prev,
                          heroImageUrl: images[0] ?? prev.heroImageUrl,
                        }))
                      }
                      onUpload={uploadHeroImage}
                    />
                  </Grid>
                </Grid>
              )}

              {activeTab === "policies" && (
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12 }}>
                    <AdminField
                      label="Delivery Policy"
                      value={policies.deliveryPolicy}
                      onChange={(v) =>
                        setPolicies((prev) => ({ ...prev, deliveryPolicy: v }))
                      }
                      multiline
                      minRows={4}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <AdminField
                      label="Return Policy"
                      value={policies.returnPolicy}
                      onChange={(v) =>
                        setPolicies((prev) => ({ ...prev, returnPolicy: v }))
                      }
                      multiline
                      minRows={4}
                    />
                  </Grid>
                </Grid>
              )}

              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    borderRadius: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontSize: "0.72rem",
                    bgcolor: "text.primary",
                    "&:hover": { bgcolor: "text.secondary" },
                  }}
                >
                  {saving ? "Saving..." : `Save ${sectionTitle}`}
                </Button>
              </Stack>
            </>
          )}

          <AdminFeedbackSnackbar
            open={Boolean(message)}
            message={message}
            severity={messageType}
            onClose={() => setMessage("")}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};
