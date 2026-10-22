/**
 * A huge outlined word behind a section that slides sideways as the page
 * scrolls (driven by `--p` from ScrollFx). Decorative only.
 */
export default function BgWord({ text, reverse }: { text: string; reverse?: boolean }) {
  return (
    <div className={`bgword${reverse ? " bgword--rev" : ""}`} data-sfx="" aria-hidden="true">
      <span>
        {text} <i>{text}</i> {text}
      </span>
    </div>
  );
}
