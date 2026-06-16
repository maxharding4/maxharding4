// Bundle-time shim for `next/image`. The Next image optimizer needs the Next
// runtime; for a design-system preview a plain <img> is the faithful render.
// `fill` is emulated with absolute positioning + object-cover, matching how
// next/image behaves in the components. Aliased in via cfg.tsconfig.
import * as React from "react";

type Src = string | { src: string };
type ImageProps = {
  src: Src;
  alt?: string;
  fill?: boolean;
  width?: number | string;
  height?: number | string;
  sizes?: string;
  loading?: "lazy" | "eager";
  className?: string;
  style?: React.CSSProperties;
} & Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "width" | "height" | "loading"
>;

export default function Image({
  src,
  alt = "",
  fill,
  width,
  height,
  sizes,
  loading,
  className,
  style,
  ...rest
}: ImageProps) {
  const resolved = typeof src === "string" ? src : src?.src;
  const fillStyle: React.CSSProperties | undefined = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }
    : undefined;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      loading={loading}
      className={className}
      style={{ ...fillStyle, ...style }}
      {...rest}
    />
  );
}
