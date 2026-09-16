import { Container } from "@mui/material";
import type { PropsWithChildren } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { CustomerAuthProvider } from "@/providers/customer-auth-provider";

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <CustomerAuthProvider>
      <SiteHeader />
      <Container component="main" maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        {children}
      </Container>
      <SiteFooter />
      <FloatingWhatsApp />
    </CustomerAuthProvider>
  );
}
