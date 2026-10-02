// A plain, generated placeholder — diagonal hairlines and a "+" mark, in the
// site's own ink/paper language. Used wherever a real photo hasn't been
// provided yet, instead of a stock/AI image standing in for one.
const SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
  <defs>
    <pattern id='h' width='16' height='16' patternTransform='rotate(45)' patternUnits='userSpaceOnUse'>
      <rect width='16' height='16' fill='#0a0a0a'/>
      <line x1='0' y1='0' x2='0' y2='16' stroke='rgba(255,255,255,0.07)' stroke-width='1'/>
    </pattern>
  </defs>
  <rect width='800' height='600' fill='url(#h)'/>
  <text x='400' y='312' font-family='ui-monospace,monospace' font-size='34' fill='rgba(255,255,255,0.28)' text-anchor='middle'>+</text>
</svg>`;

export const NO_PHOTO_IMAGE = `data:image/svg+xml,${encodeURIComponent(SVG)}`;
