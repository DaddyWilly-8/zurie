import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { getDashboardCountsState } from "@/lib/local-data";

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Card>
    <CardContent>
      <Typography color="text.secondary">{label}</Typography>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
  </Card>
);

export default async function AdminPage() {
  const counts = getDashboardCountsState();

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Dashboard Overview</Typography>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Products" value={counts.products} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Enquiries" value={counts.enquiries} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label="Newsletter Subscribers"
            value={counts.newsletterSubscribers}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
