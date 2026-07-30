import type { Metadata } from "next";
import { SITE } from "@/constants/site";

type SeoArgs = {
  title: string;
  description: string;
  path?: string;
};

export const buildMetadata = ({
  title,
  description,
  path = "/",
}: SeoArgs): Metadata => {
  const url = new URL(path, SITE.url).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.displayName,
      locale: SITE.locale,
      type: "website",
      images: [
        { url: SITE.ogImage, width: 1200, height: 630, alt: SITE.displayName },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE.ogImage],
    },
  };
};
