"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import {
  mediaActions,
  MediaGrid,
  MediaToolbar,
  type AdminMediaItem,
} from "@/features/admin/media";

type Props = {
  initialData: AdminMediaItem[];
  initialCount: number;
};

export const AdminMediaLibraryClient = ({ initialData, initialCount }: Props) => {
  const [rows, setRows] = useState(initialData);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("general");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / mediaActions.pageSize)), [count]);

  const load = useCallback(async (nextPage: number, nextSearch = search) => {
    try {
      const payload = await mediaActions.list(nextPage, nextSearch);
      setRows(payload.data);
      setCount(payload.count);
      setPage(nextPage);
    } catch {
      setMessage("Failed to load media");
      setMessageType("error");
    }
  }, [search]);

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
    await load(1);
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
    await load(page);
  };

  useEffect(() => {
    if (initialData.length === 0) {
      void load(1);
    }
  }, [initialData.length, load]);

  return (
    <Stack spacing={3}>
      {message ? <Alert severity={messageType} onClose={() => setMessage("")} sx={{ borderRadius: 1.5 }}>{message}</Alert> : null}

      <Card sx={{ border: "1px solid #ebe2d5", boxShadow: "none", bgcolor: "#fbf8f3" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "#aa8d66" }}>
              Media
            </Typography>
            <Typography variant="h6" sx={{ color: "#171512" }}>
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
              void load(1, search);
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
        <Typography color="text.secondary">No media uploaded yet.</Typography>
      ) : null}

      <Stack direction="row" justifyContent="flex-end">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => {
            void load(value);
          }}
        />
      </Stack>
    </Stack>
  );
};
