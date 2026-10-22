import type { CSSProperties, ReactNode } from "react";

/**
 * Server-safe building blocks. Anything with a `data-rv` attribute is picked
 * up by <RevealObserver/> and gets `.is-in` once it scrolls into view; the CSS
 * does the rest, so these components never need to be client components.
 */

/** Wraps each word in a mask so a heading can rise word by word. */
type Accent = "" | "it" | "ol" | "mk";
const MARKS: Record<string, Accent> = { "*": "it", "~": "ol", _: "mk" };

/**
 * Words that rise into place one by one. A heading can carry accents:
 * `*an italic serif*`, `~outlined~` and `_a highlighter band_` (the band
 * sweeps in on reveal and drifts with the scroll). The markers never show.
 */
export function SplitWords({ text, delay = 0 }: { text: string; delay?: number }) {
  let accent: Accent = "";
  const words = text.split(" ").map((raw) => {
    let w = raw;
    const open = MARKS[w[0]];
    if (!accent && open) {
      accent = open;
      w = w.slice(1);
    }
    const style = accent;
    const tail = w.match(/[*~_]([.,!?:;]*)$/);
    if (style && tail && MARKS[tail[0][0]] === style) {
      w = w.slice(0, tail.index) + tail[1];
      accent = "";
    }
    return { w, style };
  });
  return (
    <>
      {words.map(({ w, style }, i) => (
        <span key={i}>
          <span className={`sw${style ? ` sw--${style}` : ""}`} style={{ "--d": `${delay}s` } as CSSProperties} data-sfx={style === "mk" ? "" : undefined}>
            <span style={{ "--i": i } as CSSProperties}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

/** Strips the accent markers, for places that need the plain sentence. */
export const plainText = (text: string) => text.replace(/[*~_]/g, "");

const Arrow = () => (
  <svg className="cta__ic" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2 10L10 2M10 2H3.5M10 2v6.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

/** Bordered call to action whose label rolls up and fills on hover. */
export function Cta({
  href,
  children,
  tone = "light",
  width,
  external,
  download,
  onClick,
}: {
  href: string;
  children: string;
  tone?: "light" | "dark" | "ember";
  width?: number;
  external?: boolean;
  download?: boolean;
  onClick?: () => void;
}) {
  const style = width ? ({ "--cta-w": `${width}px` } as CSSProperties) : undefined;
  return (
    <a
      href={href}
      className={`cta cta--${tone}`}
      style={style}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={download || undefined}
      onClick={onClick}
    >
      <span className="cta__text">
        <span className="cta__label">{children}</span>
        <span className="cta__label cta__label--hover" aria-hidden="true">
          {children}
        </span>
      </span>
      <Arrow />
    </a>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 10L10 2M10 2H3.5M10 2v6.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Eyebrow({ children, rv = true }: { children: ReactNode; rv?: boolean }) {
  return (
    <p className={`eyebrow${rv ? " rv" : ""}`} data-rv={rv || undefined}>
      {children}
    </p>
  );
}

/** Responsive WebP pair produced by the media script (…-800 / …-1600). */
export function Img({
  src,
  alt,
  sizes = "(max-width: 809px) 92vw, 50vw",
  className,
  eager,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={`${src}-1600.webp`}
      srcSet={`${src}-800.webp 800w, ${src}-1600.webp 1600w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
