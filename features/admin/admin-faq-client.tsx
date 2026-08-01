"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faEdit, faTimes, faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { AdminField, AdminToggle } from "@/components/admin";
import { faqService, type FAQ } from "@/services/faq/faq.service";

export const AdminFaqClient = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newDisplayOrder, setNewDisplayOrder] = useState(1);
  const [newIsVisible, setNewIsVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const data = await faqService.listFaqs();
      setFaqs(data as FAQ[]);
    } catch {
      setMessage("Failed to load FAQs");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFaqs();
  }, []);

  const createFaq = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setMessage("Please fill in both question and answer");
      setMessageType("error");
      return;
    }

    try {
      await faqService.createFaq({
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        display_order: newDisplayOrder,
        is_visible: newIsVisible,
      });
      setNewQuestion("");
      setNewAnswer("");
      setNewDisplayOrder(faqs.length + 1);
      setNewIsVisible(true);
      setIsAdding(false);
      setMessage("FAQ created successfully");
      setMessageType("success");
      await loadFaqs();
    } catch {
      setMessage("Failed to create FAQ");
      setMessageType("error");
    }
  };

  const updateFaq = async (id: string) => {
    const faq = faqs.find((f) => f.id === id);
    if (!faq) return;

    try {
      await faqService.updateFaq(id, {
        question: faq.question,
        answer: faq.answer,
        display_order: faq.display_order,
        is_visible: faq.is_visible,
      });
      setEditingId(null);
      setMessage("FAQ updated successfully");
      setMessageType("success");
      await loadFaqs();
    } catch {
      setMessage("Failed to update FAQ");
      setMessageType("error");
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      await faqService.deleteFaq(id);
      setMessage("FAQ deleted successfully");
      setMessageType("success");
      await loadFaqs();
    } catch {
      setMessage("Failed to delete FAQ");
      setMessageType("error");
    }
  };

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      await faqService.updateFaq(id, { is_visible: !currentVisibility });
      await loadFaqs();
    } catch {
      setMessage("Failed to update FAQ visibility");
      setMessageType("error");
    }
  };

  const handleEditChange = (id: string, field: keyof FAQ, value: string | number | boolean) => {
    setFaqs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <Stack spacing={3}>
      {message && (
        <Alert severity={messageType} onClose={() => setMessage("")} sx={{ borderRadius: 1.5 }}>
          {message}
        </Alert>
      )}

      <Card sx={{ border: "1px solid #ebe2d5", boxShadow: "none", bgcolor: "#fbf8f3" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Stack spacing={0.5}>
              <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "#aa8d66" }}>
                FAQ
              </Typography>
              <Typography variant="h6" sx={{ color: "#171512" }}>
                FAQ Management
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              {faqs.length} {faqs.length === 1 ? "FAQ" : "FAQs"}
            </Typography>
          </Stack>

          {!isAdding && (
            <Button
              variant="contained"
              startIcon={<FontAwesomeIcon icon={faPlus} size="sm" />}
              onClick={() => setIsAdding(true)}
              sx={{ borderRadius: 1, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: "0.72rem", mb: 2, bgcolor: "#171512", "&:hover": { bgcolor: "#2d2a26" } }}
            >
              Add FAQ
            </Button>
          )}

          {isAdding && (
            <Box sx={{ mb: 3, p: 2.5, bgcolor: "#f8f6f2", border: "1px solid #e9e2d8" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: "#171512" }}>
                  New FAQ
                </Typography>
                <IconButton size="small" onClick={() => setIsAdding(false)}>
                  <FontAwesomeIcon icon={faTimes} size="sm" />
                </IconButton>
              </Stack>
              <Stack spacing={1.5}>
                <AdminField label="Question" value={newQuestion} onChange={setNewQuestion} placeholder="Enter the question..." />
                <AdminField label="Answer" value={newAnswer} onChange={setNewAnswer} multiline minRows={3} placeholder="Enter the answer..." />
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="Display Order"
                    type="number"
                    value={newDisplayOrder}
                    onChange={(e) => setNewDisplayOrder(Number(e.target.value))}
                    sx={{ width: 180, bgcolor: "#ffffff", "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                    InputLabelProps={{ sx: { textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.7rem", color: "#7f7467", fontWeight: 500 } }}
                  />
                  <AdminToggle label="Visible" checked={newIsVisible} onChange={setNewIsVisible} />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={createFaq} size="small" sx={{ borderRadius: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: "0.68rem", bgcolor: "#171512", "&:hover": { bgcolor: "#2d2a26" } }}>
                    Create FAQ
                  </Button>
                  <Button variant="outlined" onClick={() => setIsAdding(false)} size="small" sx={{ borderRadius: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: "0.68rem", borderColor: "#e0d4c1", color: "#171512" }}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          {loading ? (
            <Typography color="text.secondary">Loading FAQs...</Typography>
          ) : faqs.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography color="text.secondary">No FAQs yet.</Typography>
              <Typography variant="caption" color="text.secondary">
                Click the &quot;Add FAQ&quot; button to create your first FAQ.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {faqs.map((faq) => {
                const isEditing = editingId === faq.id;
                return (
                  <Box
                    key={faq.id}
                    sx={{
                      p: 2,
                      bgcolor: "#ffffff",
                      border: isEditing ? "1px solid #171512" : "1px solid #e9e2d8",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isEditing ? (
                      <Stack spacing={1.5}>
                        <AdminField label="Question" value={faq.question} onChange={(value) => handleEditChange(faq.id, "question", value)} />
                        <AdminField label="Answer" value={faq.answer} onChange={(value) => handleEditChange(faq.id, "answer", value)} multiline minRows={2} />
                        <Stack direction="row" spacing={2} alignItems="center">
                          <TextField
                            label="Display Order"
                            type="number"
                            value={faq.display_order}
                            onChange={(e) => handleEditChange(faq.id, "display_order", Number(e.target.value))}
                            sx={{ width: 180, bgcolor: "#ffffff", "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                            InputLabelProps={{ sx: { textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.7rem", color: "#7f7467", fontWeight: 500 } }}
                          />
                          <AdminToggle label="Visible" checked={faq.is_visible} onChange={(checked) => handleEditChange(faq.id, "is_visible", checked)} />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => updateFaq(faq.id)}
                            sx={{ borderRadius: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: "0.68rem", bgcolor: "#171512", "&:hover": { bgcolor: "#2d2a26" } }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setEditingId(null)}
                            sx={{ borderRadius: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: "0.68rem", borderColor: "#e0d4c1", color: "#171512" }}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body2" fontWeight={600}>
                                {faq.display_order}. {faq.question}
                              </Typography>
                              {!faq.is_visible && (
                                <Chip
                                  label="Hidden"
                                  size="small"
                                  color="default"
                                  sx={{ fontSize: "0.6rem" }}
                                />
                              )}
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {faq.answer}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => toggleVisibility(faq.id, faq.is_visible)}
                              sx={{ color: faq.is_visible ? "text.secondary" : "text.disabled" }}
                            >
                              <FontAwesomeIcon icon={faGripVertical} size="sm" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => setEditingId(faq.id)}
                              sx={{ color: "text.secondary" }}
                            >
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => deleteFaq(faq.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} size="sm" />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};