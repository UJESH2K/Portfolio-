"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * A background-removed portrait slot. If the file is missing, it shows
 * nothing but a faint outline and a hint — the persistent Universe backdrop
 * (components/site/Universe.tsx) already carries the 3D visual weight behind
 * the whole page, so this doesn't need its own second WebGL canvas the way
 * it once did. Drop a file at the path shown and it takes over instantly.
 */
export default function Cutout({ src, alt, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const path = src.replace(/^\//, "public/");

  if (failed) {
    return (
      <div className={`relative flex items-end justify-center ${className}`} aria-hidden>
        <div className="h-[70%] w-[55%] rounded-t-full border border-dashed border-white/15" />
        <span className="mono pointer-events-none absolute bottom-3 left-1/2 w-max -translate-x-1/2 text-white/30">
          Drop photo at {path}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-contain object-bottom ${className}`}
    />
  );
}
