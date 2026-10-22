/**
 * A band between two sections: a rule above and below, a small label, and
 * one huge word running across the screen that slides sideways as the band
 * scrolls through (driven by `--p` from ScrollFx). It sits in the page flow,
 * so it closes one section and opens the next without covering either.
 */
export default function SectionBand({ text, label, index, reverse }: { text: string; label: string; index: string; reverse?: boolean }) {
  return (
    <div className={`sband${reverse ? " sband--rev" : ""}`} data-sfx="" aria-hidden="true">
      <div className="sband__meta">
        <span>( {index} )</span>
        <span>{label}</span>
      </div>
      <div className="sband__track">
        <span>
          {[0, 1, 2].map((i) => (
            <span key={i}>
              <b>{text}</b>
              <i>{text}</i>
              <em>✳</em>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
