"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_NAV } from "@/lib/content";

/**
 * The top nav: one capsule holding the site's chapters, centred between the
 * wordmark and the burger.
 *
 *   - On the landing it shows every chapter in one row.
 *   - Once a chapter is being read, it condenses to that chapter alone
 *     ("● 04/07 Experience") with a hairline that fills as the chapter is
 *     read; hovering or tabbing into it opens the full row again.
 *   - A light marker sits behind the chapter being read and glides to
 *     whichever link the pointer is on.
 *   - Phones and touch screens keep the condensed capsule (it sits beside
 *     the burger) and a tap on it opens the full menu.
 *
 * Expanding and condensing is CSS (grid tracks animating between 0fr and
 * 1fr); a ResizeObserver on the links keeps the marker on its link while
 * they resize.
 */

type Props = {
  navigate: (href: string) => (e: React.MouseEvent) => void;
  openMenu: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function NavPill({ navigate, openMenu }: Props) {
  const [active, setActive] = useState(-1);
  const [hover, setHover] = useState(-1);
  const nav = useRef<HTMLElement>(null);
  const items = useRef<Array<HTMLLIElement | null>>([]);
  const mark = useRef<HTMLSpanElement>(null);
  const target = hover >= 0 ? hover : active;
  const targetRef = useRef(target);
  targetRef.current = target;

  // Which chapter is being read: the last one whose start has passed 45% of
  // the viewport (or the last one at the very bottom of the page). Chapter
  // starts are cached and re-measured whenever the page changes height.
  useEffect(() => {
    let starts: number[] = [];
    const measure = () => {
      starts = SITE_NAV.map((c) => {
        const el = document.querySelector(c.from ?? c.href);
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
      });
    };
    let raf = 0;
    const read = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const line = y + vh * 0.45;
      let idx = -1;
      starts.forEach((s, i) => {
        if (s <= line) idx = i;
      });
      const bottom = y + vh >= document.documentElement.scrollHeight - 4;
      if (bottom) idx = SITE_NAV.length - 1;
      setActive(idx);
      // How far through the current chapter, for the hairline.
      let p = 0;
      if (idx >= 0) {
        const end = idx + 1 < starts.length ? starts[idx + 1] : document.documentElement.scrollHeight - vh * 0.55;
        p = bottom ? 1 : Math.min(1, Math.max(0, (line - starts[idx]) / Math.max(1, end - starts[idx])));
      }
      nav.current?.style.setProperty("--cp", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    measure();
    read();
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Keep the marker on its link, including while the links resize.
  useEffect(() => {
    const m = mark.current;
    if (!m) return;
    const place = () => {
      const li = targetRef.current >= 0 ? items.current[targetRef.current] : null;
      if (!li) {
        m.style.opacity = "0";
        return;
      }
      const fresh = m.style.opacity !== "1";
      if (fresh) m.style.transition = "none";
      m.style.transform = `translate3d(${li.offsetLeft}px, 0, 0)`;
      m.style.width = `${li.offsetWidth}px`;
      if (fresh) {
        void m.offsetWidth;
        m.style.transition = "";
      }
      m.style.opacity = li.offsetWidth > 4 ? "1" : "0";
    };
    place();
    const ro = new ResizeObserver(place);
    items.current.forEach((li) => li && ro.observe(li));
    return () => ro.disconnect();
  }, [target]);

  const compact = active >= 0;

  // Condensed on a touch screen or a phone, the whole capsule is a menu button.
  const asMenu = () => compact && window.matchMedia("(hover: none), (max-width: 1023px)").matches;
  const onLink = (href: string) => (e: React.MouseEvent) => {
    if (asMenu()) e.preventDefault();
    else navigate(href)(e);
  };

  return (
    <nav
      ref={nav}
      className={`navpill${compact ? " is-compact" : ""}`}
      aria-label="Primary"
      onPointerLeave={() => setHover(-1)}
      onClick={() => asMenu() && openMenu()}
    >
      <span className="navpill__dot" aria-hidden="true" />
      <span className="navpill__count" aria-hidden="true">
        <span>
          <span key={active} className="navpill__num">
            {pad(Math.max(1, active + 1))}
          </span>
          /{pad(SITE_NAV.length)}
        </span>
      </span>
      <div className="navpill__track">
        <span ref={mark} className="navpill__mark" aria-hidden="true" />
        <ul>
          {SITE_NAV.map((c, i) => (
            <li
              key={c.href}
              ref={(n) => {
                items.current[i] = n;
              }}
              className={`${i === active ? "is-active" : ""}${i === target ? " is-lit" : ""}`}
              onPointerEnter={() => setHover(i)}
            >
              <a href={c.href} onClick={onLink(c.href)} aria-current={i === active ? "location" : undefined}>
                <span className="navpill__t">
                  <i>{c.label}</i>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <span className="navpill__read" aria-hidden="true" />
    </nav>
  );
}
