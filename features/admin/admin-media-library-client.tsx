"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { AdminFeedbackSnackbar } from "@/components/admin";
import {
  mediaActions,
  MediaGrid,
  MediaToolbar,
} from "@/features/admin/media";

export const AdminMediaLibraryClient = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("general");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(false);

  const {
    data: payload,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-media", page, search],
    queryFn: () => mediaActions.list(page, search),
  });

  const rows = payload?.data ?? [];
  const count = payload?.count ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / mediaActions.pageSize)), [count]);

  const upload = async (file: File) => {
    setLoading(true);
    setMessage("");

    try {
      await mediaActions.upload(file, folder);
      setMessage("Upload successful");
      setMessageType("success");
    } catch {
      setMessage("Upload failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
    await refetch();
  };

  const remove = async (id: string) => {
    try {
      await mediaActions.remove(id);
      setMessage("Media deleted successfully");
      setMessageType("success");
    } catch {
      setMessage("Delete failed");
      setMessageType("error");
    }
    await refetch();
  };

  return (
    <Stack spacing={3}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity={messageType}
        onClose={() => setMessage("")}
      />

      <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>
              Media
            </Typography>
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              Media Library
            </Typography>
          </Stack>

          <MediaToolbar
            search={search}
            folder={folder}
            loading={loading}
            onSearchChange={setSearch}
            onFolderChange={setFolder}
            onSearch={() => {
              setPage(1);
              void refetch();
            }}
            onUpload={(file) => {
              void upload(file);
            }}
          />
        </CardContent>
      </Card>

      <MediaGrid
        rows={rows}
        onCopyUrl={(url) => {
          void navigator.clipboard.writeText(url);
        }}
        onDelete={(id) => {
          void remove(id);
        }}
      />

      {rows.length === 0 ? (
        isError ? (
          <Typography color="error.main">Failed to load media.</Typography>
        ) : (
          <Typography color="text.secondary">No media uploaded yet.</Typography>
        )
      ) : null}

      <Stack direction="row" justifyContent="flex-end">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
        />
      </Stack>
    </Stack>
  );
};
