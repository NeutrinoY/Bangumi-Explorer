"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "./cn";

interface FadeInImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

/**
 * next/image that fades in on load instead of popping. Cached images
 * (back/forward, pagination revisits) skip the fade via onLoad firing
 * synchronously before paint.
 */
export function FadeInImage({ className, ...props }: FadeInImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      unoptimized
      onLoad={() => setLoaded(true)}
      className={cn(
        "transition-opacity duration-300 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
