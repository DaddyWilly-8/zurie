import Image from "next/image";
import { Box, Grid } from "@mui/material";

const images = [
  "/images/instagram/ig-1.png",
  "/images/instagram/ig-2.png",
  "/images/instagram/ig-3.png",
  "/images/instagram/ig-4.png",
  "/images/instagram/ig-5.png",
  "/images/instagram/ig-6.png",
];

export const InstagramGallery = () => {
  return (
    <Grid container spacing={2}>
      {images.map((image) => (
        <Grid key={image} size={{ xs: 6, md: 2 }}>
          <Box
            sx={{
              position: "relative",
              height: { xs: 140, md: 180 },
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Image
              src={image}
              alt="Instagram gallery"
              fill
              sizes="(max-width: 768px) 50vw, 16vw"
              style={{ objectFit: "cover" }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};
