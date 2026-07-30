import { CircularProgress, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: "40vh" }}
    >
      <CircularProgress />
    </Stack>
  );
}
