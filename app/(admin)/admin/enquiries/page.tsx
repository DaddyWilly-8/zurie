import { Card, CardContent, Stack, Typography } from "@mui/material";
import { listEnquiriesState } from "@/lib/local-data";

export default async function AdminEnquiriesPage() {
  const enquiries = listEnquiriesState();

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Customer Enquiries</Typography>
      {enquiries.map((entry) => (
        <Card key={entry.id}>
          <CardContent>
            <Typography variant="subtitle1">
              {entry.name} · {entry.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {entry.message}
            </Typography>
          </CardContent>
        </Card>
      ))}
      {enquiries.length === 0 ? (
        <Typography color="text.secondary">No enquiries yet.</Typography>
      ) : null}
    </Stack>
  );
}
