import { color } from 'd3-color';

export default function luminance(colStr) {
  const c = color(colStr); // this needs to handle bad colors
  if (!c) return 0;
  const { r, g, b } = c.rgb();

  // https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const [sR, sG, sB] = [r, g, b].map((v) => v / 255);
  const [R, G, B] = [sR, sG, sB].map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));

  return +(0.2126 * R + 0.7152 * G + 0.0722 * B).toFixed(5);
}
