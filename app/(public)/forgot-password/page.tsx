import { Card, CardContent, Container, Typography } from "@mui/material";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Forgot Password | Zuriè",
  description: "Reset your Zuriè account password.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography
            variant="h4"
            sx={{ mb: 3, fontFamily: "var(--font-playfair), serif" }}
          >
            Forgot Password
          </Typography>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </Container>
  );
}
