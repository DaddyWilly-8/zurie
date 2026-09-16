import { Suspense } from "react";
import { Card, CardContent, Container, Typography } from "@mui/material";
import { LoginForm } from "@/features/auth/login-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Sign In | Zuriè",
  description: "Sign in to your Zuriè account.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography
            variant="h4"
            sx={{ mb: 3, fontFamily: "var(--font-playfair), serif" }}
          >
            Sign In
          </Typography>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </Container>
  );
}
