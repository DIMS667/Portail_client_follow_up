import type { ImgHTMLAttributes } from "react";

type ResponsiveImageDefinition = {
  width: number;
  height: number;
  webp: string;
  webp640: string;
  webp960: string;
};

const responsiveImages: Record<string, ResponsiveImageDefinition> = {
  "/images/public-hero-collage.png": {
    width: 1504,
    height: 1034,
    webp: "/images/public-hero-collage.webp",
    webp640: "/images/public-hero-collage-640.webp",
    webp960: "/images/public-hero-collage-960.webp",
  },
  "/images/public-claims-advisor.png": {
    width: 1374,
    height: 1145,
    webp: "/images/public-claims-advisor.webp",
    webp640: "/images/public-claims-advisor-640.webp",
    webp960: "/images/public-claims-advisor-960.webp",
  },
  "/images/public-entrepreneur.png": {
    width: 1536,
    height: 1024,
    webp: "/images/public-entrepreneur.webp",
    webp640: "/images/public-entrepreneur-640.webp",
    webp960: "/images/public-entrepreneur-960.webp",
  },
  "/images/public-role-advisor.png": {
    width: 1484,
    height: 1060,
    webp: "/images/public-role-advisor.webp",
    webp640: "/images/public-role-advisor-640.webp",
    webp960: "/images/public-role-advisor-960.webp",
  },
};

type ResponsivePublicImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "width" | "height"
> & {
  src: string;
  alt: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
};

export function ResponsivePublicImage({
  src,
  alt,
  sizes = "100vw",
  fallbackWidth,
  fallbackHeight,
  decoding = "async",
  ...imageProps
}: ResponsivePublicImageProps) {
  const definition = responsiveImages[src];

  if (!definition) {
    return (
      <img
        {...imageProps}
        src={src}
        alt={alt}
        width={fallbackWidth}
        height={fallbackHeight}
        sizes={sizes}
        decoding={decoding}
      />
    );
  }

  const srcSet = [
    `${definition.webp640} 640w`,
    `${definition.webp960} 960w`,
    `${definition.webp} ${definition.width}w`,
  ].join(", ");

  return (
    <picture className="public-responsive-picture">
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img
        {...imageProps}
        src={src}
        alt={alt}
        width={definition.width}
        height={definition.height}
        sizes={sizes}
        decoding={decoding}
      />
    </picture>
  );
}
