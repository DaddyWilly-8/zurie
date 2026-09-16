import { Card, CardContent, Container, Typography } from "@mui/material";
import { RegisterForm } from "@/features/auth/register-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Create Account | Zuriè",
  description: "Create your Zuriè account.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography
            variant="h4"
            sx={{ mb: 3, fontFamily: "var(--font-playfair), serif" }}
          >
            Create Account
          </Typography>
          <RegisterForm />
        </CardContent>
      </Card>
    </Container>
  );
}
