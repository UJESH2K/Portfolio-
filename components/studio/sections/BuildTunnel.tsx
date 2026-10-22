"use client";

import { CAPABILITIES } from "@/lib/content";
import PerspectiveTunnelHero, { type TunnelItem } from "@/components/ui/perspective-tunnel-hero";
import { Cta } from "../primitives";

/** His own photos, captioned: wins, stages and the people he builds with. */
const PHOTOS: Extract<TunnelItem, { kind: "image" }>[] = [
  { kind: "image", src: "/media/win-inception-solo", alt: "Ujesh with the Inception winner's cheque", title: "Inception", caption: "Winner" },
  { kind: "image", src: "/media/life-podium", alt: "Ujesh speaking at a podium", title: "On stage" },
  { kind: "image", src: "/media/win-cypher", alt: "Winners on stage with certificates at Cypher", title: "Cypher 1", caption: "Winner" },
  { kind: "image", src: "/media/win-denova", alt: "Presenting at the Denova hackathon", title: "Denova", caption: "Winner · Solana track" },
  { kind: "image", src: "/media/life-classroom", alt: "Ujesh presenting model-training results to a room", title: "Presenting results" },
  { kind: "image", src: "/media/win-cardano-cheque", alt: "Holding the cheque at the Cardano hackathon", title: "Cardano", caption: "Winner" },
  { kind: "image", src: "/media/life-mic", alt: "Ujesh pitching with a microphone", title: "Pitching the build" },
  { kind: "image", src: "/media/win-cypher-2", alt: "Certificates in hand after Cypher 3", title: "Cypher 3", caption: "Winner, again" },
  { kind: "image", src: "/media/life-hacking-floor", alt: "A packed hackathon floor", title: "Let the hacking begin" },
  { kind: "image", src: "/media/win-hackerrank", alt: "Teams at the HackerRank Orchestrate finals", title: "HackerRank Orchestrate", caption: "Bronze" },
  { kind: "image", src: "/media/life-group", alt: "A big group photo on a staircase", title: "The whole crew" },
  { kind: "image", src: "/media/life-selfie", alt: "A team selfie at a hackathon", title: "Team selfie" },
  { kind: "image", src: "/media/win-gsc", alt: "The team at the Google Solution Challenge bootcamp", title: "Google Solution Challenge" },
  { kind: "image", src: "/media/life-talk", alt: "Ujesh speaking into a microphone", title: "On the mic" },
];

/** Photos with a "what I build" card after every few. */
const ITEMS: TunnelItem[] = (() => {
  const caps = CAPABILITIES.map((c) => ({ kind: "text" as const, title: c.title, sub: c.sub, text: c.text, num: c.num }));
  const out: TunnelItem[] = [];
  PHOTOS.forEach((p, i) => {
    out.push(p);
    if (i % 3 === 1 && caps.length) out.push(caps.shift()!);
  });
  return [...out, ...caps];
})();

/**
 * "What I build": a perspective tunnel of his photos and the five things he
 * builds, flying past a fixed title as the page scrolls.
 */
export default function BuildTunnel() {
  return (
    <section id="build" className="build-tunnel" data-cue="build" aria-labelledby="build-title">
      <PerspectiveTunnelHero
        items={ITEMS}
        eyebrow="Full-stack · Applied AI · GPU systems"
        title={<h2 id="build-title">What I build.</h2>}
        subtitle="Products with real users, AI that earns its place, and the hackathon floors where most of it started."
      >
        <Cta href="#skills" width={300}>
          See every skill
        </Cta>
      </PerspectiveTunnelHero>
    </section>
  );
}
