"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { HERO, SITE_NAV, SOCIALS, WORK, isMissing } from "@/lib/content";
import { goTo, useRobot } from "@/lib/robot";

/**
 * The fixed frame around every page: wordmark, two-column nav (only while
 * the hero is on screen), burger + full menu, and the bottom bar with a live
 * Bengaluru clock and the sound switch. Everything blends with `difference`
 * so it reads on the dark hero and the paper pages alike.
 */

function useClock(tz: string) {
  const [now, setNow] = useState<string>("--:--:-- --");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tz]);
  return now;
}

function Turbine() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 6.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM8.9 6.2C9.6 3.9 9 1.6 7 1c2.9-.4 5 1.7 4.6 4.4-.3 1-1.5 1.4-2.7.8ZM9.6 9C12 9.4 13.9 11 13.5 13.1c-1.6-2.4-4.6-2.9-5.4-.9-.4-1 0-2.5 1.5-3.2ZM6.6 9.6C5 11.4 2.7 12 1.2 10.6c2.9.7 5.1-1.5 4.1-3.4.9.3 1.7 1.4 1.3 2.4Z"
      />
    </svg>
  );
}

export default function Chrome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const muted = useRobot((s) => s.muted);
  const toggleMuted = useRobot((s) => s.toggleMuted);
  const time = useClock(HERO.timezone);
  const closeRef = useRef<HTMLButtonElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setNavHidden(window.scrollY > window.innerHeight * 0.25);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    const burger = burgerRef.current;
    lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
      burger?.focus();
    };
  }, [menuOpen]);

  const navigate = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    window.setTimeout(() => goTo(href), menuOpen ? 450 : 0);
  };

  const links = [{ label: "Home", href: "#top" }, ...SITE_NAV.primary, ...SITE_NAV.secondary];
  const socials = SOCIALS.filter((s) => s.id !== "email" && !isMissing(s.href));

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <a className="chrome chrome--logo" href="#top" onClick={navigate("#top")} aria-label="Ujesh Yadav, back to top">
        Ujesh Yadav<sup>®</sup>
      </a>

      <nav className={`chrome chrome--nav${navHidden ? " is-hidden" : ""}`} aria-label="Primary">
        <ul>
          {SITE_NAV.primary.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={navigate(l.href)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <ul>
          {SITE_NAV.secondary.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={navigate(l.href)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <button
        ref={burgerRef}
        className="chrome chrome--burger"
        type="button"
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        onClick={() => setMenuOpen(true)}
      >
        <span />
        <span />
      </button>

      <div className={`menu${menuOpen ? " is-open" : ""}`} id="site-menu" aria-hidden={!menuOpen}>
        <div className="menu__backdrop" onClick={() => setMenuOpen(false)} />
        <div className="menu__panel" role="dialog" aria-modal="true" aria-label="Menu">
          <button ref={closeRef} className="menu__close" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 3l14 14M17 3L3 17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <p className="menu__eyebrow menu__rise">NAVIGATION</p>
          <ul className="menu__nav">
            {links.map((l, i) => (
              <li key={l.href}>
                <a
                  className="menu__rise"
                  style={{ "--d": `${i * 0.05}s` } as CSSProperties}
                  href={l.href}
                  onClick={navigate(l.href)}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="menu__bottom">
            <div>
              <p className="menu__rise">Recent work</p>
              <ul>
                {WORK.slice(0, 4).map((w, i) => (
                  <li key={w.id} className="menu__rise" style={{ "--d": `${0.1 + i * 0.05}s` } as CSSProperties}>
                    <a href="#work" onClick={navigate("#work")} tabIndex={menuOpen ? 0 : -1}>
                      {w.title} [{w.tags[0]}]
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="menu__rise">Socials</p>
              <ul>
                {socials.map((s, i) => (
                  <li key={s.id} className="menu__rise" style={{ "--d": `${0.1 + i * 0.05}s` } as CSSProperties}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" tabIndex={menuOpen ? 0 : -1}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="hbar" aria-hidden="true">
        <span>©2026</span>
        <span className="hbar__clock">
          <span className="hbar__tz">{HERO.timezoneLabel}</span>
          <span className="hbar__time">{time}</span>
        </span>
      </div>
      <button
        type="button"
        className={`hbar__sound chrome${muted ? "" : " is-on"}`}
        onClick={toggleMuted}
        aria-pressed={!muted}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
      >
        <Turbine />
        <span>Sound</span>
      </button>
    </>
  );
}
