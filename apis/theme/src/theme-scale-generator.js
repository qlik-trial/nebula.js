import { createColor } from 'qlik-chart-modules';
import ColorScale from './color-scale';

/* Calculates a value that expands from 0.5 out to 0 and 1
 * Ex for size 8:
 * current -> percent
 * 0 -> 0.0625	4 -> 0.3125
 * 1 -> 0.125	5 -> 0.375
 * 2 -> 0.1875	6 -> 0.4375
 * 3 -> 0.25		7 -> 0.5
 */

function getScaleValue(value, current, size) {
  const percent = 0.25 + ((current + 1) / size) * 0.25;
  const min = 0.5 - percent;
  const max = 0.5 + percent;
  const span = max - min;
  return min + (value / 1) * span;
}

function setupColorScale(colors, nanColor, gradient) {
  const newColors = [];
  const cs = new ColorScale(nanColor);
  newColors.push(colors[0]);

  if (!gradient) {
    newColors.push(colors[0]);
  }
  let i = 1;
  for (; i < colors.length - 1; i++) {
    newColors.push(colors[i]);
    newColors.push(colors[i]);
  }

  newColors.push(colors[i]);
  if (!gradient) {
    newColors.push(colors[i]);
  }

  for (let j = 0; j < newColors.length; j += 2) {
    cs.addColorPart(newColors[j], newColors[j + 1]);
  }

  return cs;
}

function generateLevel(scale, current, size) {
  const level = [];
  for (let j = 0; j < current + 1; j++) {
    let c;
    switch (current) {
      case 0:
        c = scale.getColor(0.5);
        break;
      default: {
        const scaled = getScaleValue((1 / current) * j, current, size);

        c = scale.getColor(scaled);
        break;
      }
    }
    level.push(createColor(c).getHex());
  }
  return level;
}

/**
 * Generates a pyramid of colors from a minimum of 2 colors
 *
 * @ignore
 * @internal
 * @param {Array} colors an array of colors to generate from
 * @param {number} size the integer size of the base of the pyramid
 * @returns {Array} A 2 dimensional array containing the levels of the color pyramid
 */
function createPyramidFromColors(colors, size, nanColor) {
  const gradientScale = setupColorScale(colors, nanColor, true);
  const baseLevel = generateLevel(gradientScale, size - 1, size);
  const scale = setupColorScale(baseLevel, nanColor, false);
  const pyramid = [null];
  for (let i = 0; i < size; i++) {
    pyramid.push(generateLevel(scale, i, size));
  }
  return pyramid;
}

export default function generateOrdinalScales(scalesDef, nanColor = '#d2d2d2') {
  scalesDef.forEach((def) => {
    if (def.type === 'class') {
      // generate pyramid
      const pyramid = createPyramidFromColors(def.scale, Math.max(def.scale.length, 7), nanColor);
      // eslint-disable-next-line no-param-reassign
      def.scale = pyramid;
      // eslint-disable-next-line no-param-reassign
      def.type = 'class-pyramid';
    }
  });
}
