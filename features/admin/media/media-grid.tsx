import Image from "next/image";
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import type { AdminMediaItem } from "./types";

type Props = {
  rows: AdminMediaItem[];
  onCopyUrl: (url: string) => void;
  onDelete: (id: string) => void;
};

export const MediaGrid = ({ rows, onCopyUrl, onDelete }: Props) => {
  return (
    <Grid container spacing={2}>
      {rows.map((item) => (
        <Grid key={item.id} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%", border: "1px solid #ebe2d5", boxShadow: "none", bgcolor: "#ffffff" }}>
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
                <Button size="small" variant="outlined" onClick={() => onCopyUrl(item.file_url)}>
                  Copy URL
                </Button>
                <Button size="small" color="error" onClick={() => onDelete(item.id)}>
                  Delete
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
