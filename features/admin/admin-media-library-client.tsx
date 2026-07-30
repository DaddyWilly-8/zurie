"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { mediaService } from "@/services/media/media.service";

export type AdminMediaItem = {
  id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
  folder: string | null;
  used_in: string[] | null;
  created_at: string;
};

type Props = {
  initialData: AdminMediaItem[];
  initialCount: number;
};

const PAGE_SIZE = 20;

export const AdminMediaLibraryClient = ({ initialData, initialCount }: Props) => {
  const [rows, setRows] = useState(initialData);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  const load = useCallback(async (nextPage: number, nextSearch = search) => {
    const payload = await mediaService.listMedia({
      page: nextPage,
      pageSize: PAGE_SIZE,
      search: nextSearch.trim() || undefined,
    });

    setRows((payload.data ?? []) as AdminMediaItem[]);
    setCount(payload.count ?? 0);
    setPage(nextPage);
  }, [search]);

  const upload = async (file: File) => {
    setLoading(true);
    setMessage("");

    try {
      await mediaService.upload(file, folder);
      setMessage("Upload successful");
    } catch {
      setMessage("Upload failed");
    } finally {
      setLoading(false);
    }
    await load(1);
  };

  const remove = async (id: string) => {
    try {
      await mediaService.remove(id);
      setMessage("Media deleted");
    } catch {
      setMessage("Delete failed");
    }
    await load(page);
  };

  useEffect(() => {
    if (initialData.length === 0) {
      void load(1);
    }
  }, [initialData.length, load]);

  return (
    <Stack spacing={2}>
      {message ? <Alert severity="info">{message}</Alert> : null}

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              label="Search Media"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
            <TextField
              label="Folder"
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              sx={{ minWidth: 200 }}
            />
            <Button variant="outlined" onClick={() => load(1, search)}>
              Search
            </Button>
            <Button variant="contained" component="label" disabled={loading}>
              Upload
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void upload(file);
                  }
                }}
              />
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {rows.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  sx={{
                    border: "1px solid #eee6db",
                    borderRadius: 1,
                    overflow: "hidden",
                    mb: 1,
                    position: "relative",
                    height: 160,
                  }}
                >
                  <Image
                    src={item.file_url}
                    alt={item.file_name}
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Typography fontWeight={700} noWrap>
                  {item.file_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(item.size_bytes / 1024)} KB
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigator.clipboard.writeText(item.file_url)}
                  >
                    Copy URL
                  </Button>
                  <Button size="small" color="error" onClick={() => remove(item.id)}>
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
