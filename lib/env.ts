import { z } from "zod";

const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), "URL must use https://");

// API_ORIGIN is the one exception allowed to be plain http:// — local dev
// points it at http://127.0.0.1:<port>, only production needs it on https.
const apiOriginUrl = z.string().url();

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: httpsUrl.optional(),
  NEXT_PUBLIC_API_ORIGIN: apiOriginUrl.optional(),
  NEXT_PUBLIC_API_MODE: z.enum(["mock", "laravel"]).optional(),
  NEXT_PUBLIC_APP_URL: httpsUrl.optional(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_ORIGIN: process.env.NEXT_PUBLIC_API_ORIGIN,
  NEXT_PUBLIC_API_MODE: process.env.NEXT_PUBLIC_API_MODE,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
});
