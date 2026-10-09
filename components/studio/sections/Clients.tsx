"use client";

import { useEffect, useRef, useState } from "react";
import { CLIENTS, CLIENTS_INTRO } from "@/lib/content";
import { ArrowIcon, Eyebrow, Img, SplitWords } from "../primitives";

/**
 * Freelance and client work as an index of names. Hovering a row floats a
 * preview of that site beside the pointer (its screen recording where there
 * is one); on touch screens each row shows its picture inline instead.
 */
export default function Clients() {
  const [hot, setHot] = useState(-1);
  const preview = useRef<HTMLDivElement>(null);
  const vids = useRef<Array<HTMLVideoElement | null>>([]);

  // The preview trails the pointer with a little lag.
  useEffect(() => {
    const el = preview.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX + 28;
      ty = e.clientY - 120;
      if (!raf) {
        x = tx;
        y = ty;
        loop();
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return;
      if (i === hot) {
        if (v.preload !== "auto") v.preload = "auto";
        void v.play().catch(() => {});
      } else v.pause();
    });
  }, [hot]);

  return (
    <section id="freelance" className="clients" data-cue="freelance" aria-labelledby="clients-title">
      <div className="wrap">
        <div className="clients__head">
          <Eyebrow>{CLIENTS_INTRO.eyebrow}</Eyebrow>
          <h2 id="clients-title" className="h2" data-rv>
            <SplitWords text={CLIENTS_INTRO.title} />
          </h2>
          <p className="lede rv" data-rv>
            {CLIENTS_INTRO.text}
          </p>
        </div>

        <ol className="clients__list" onPointerLeave={() => setHot(-1)}>
          {CLIENTS.map((c, i) => {
            const href = c.live ?? c.code;
            return (
              <li key={c.name} className={`crow rv${hot === i ? " is-hot" : ""}`} data-rv onPointerEnter={() => setHot(i)}>
                {c.image ? (
                  <figure className="crow__thumb">
                    <Img src={c.image} alt={c.imageAlt ?? c.name} sizes="92vw" />
                  </figure>
                ) : null}
                <div className="crow__main">
                  <h3 className="crow__name">{c.name}</h3>
                  <p className="crow__what">{c.what}</p>
                </div>
                <div className="crow__body">
                  <p className="crow__text">{c.text}</p>
                  {c.points ? (
                    <ul className="crow__points">
                      {c.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  ) : null}
                  {c.note ? <p className="crow__note">{c.note}</p> : null}
                </div>
                <div className="crow__side">
                  <p className="crow__role">{c.role}</p>
                  <p className="crow__year">{c.year}</p>
                  {href ? (
                    <a className={`plink${c.live ? " plink--solid" : ""}`} href={href} target="_blank" rel="noopener noreferrer">
                      {c.live ? "Visit the site" : "See the code"} <ArrowIcon />
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={`cpreview${hot >= 0 && (CLIENTS[hot]?.image || CLIENTS[hot]?.video) ? " is-on" : ""}`} ref={preview} aria-hidden="true">
        {CLIENTS.map((c, i) =>
          c.image || c.video ? (
            <div key={c.name} className={`cpreview__item${hot === i ? " is-on" : ""}`}>
              {c.image ? <Img src={c.image} alt="" sizes="420px" /> : null}
              {c.video ? (
                <video
                  ref={(n) => {
                    vids.current[i] = n;
                  }}
                  src={c.video}
                  muted
                  loop
                  playsInline
                  preload="none"
                />
              ) : null}
            </div>
          ) : null
        )}
      </div>
    </section>
  );
}
