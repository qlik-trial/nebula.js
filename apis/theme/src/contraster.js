/* eslint no-cond-assign: 0 */
import { getContrastRatio, getLuminance } from 'qlik-chart-modules';

const MAX_SIZE = 1000;

export default function colorFn(colors = ['#333333', '#ffffff']) {
  let cache = {};
  let n = 0;

  const luminances = colors.map(getLuminance);

  return {
    getBestContrastColor(colorString) {
      if (!cache[colorString]) {
        if (n > MAX_SIZE) {
          cache = {};
          n = 0;
        }
        const L = getLuminance(colorString);

        const contrasts = luminances.map((lum) => getContrastRatio(L, lum));
        const c = colors[contrasts.indexOf(Math.max(...contrasts))];

        cache[colorString] = c;
        n++;
      }
      return cache[colorString];
    },
  };
}
