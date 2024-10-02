import { createColor, getBlendedColor } from 'qlik-chart-modules';

/**
 * Gets this mapping between the scaled value and the color parts
 * @ignore
 * @param {Number} scaledValue - A value between 0 and 1 representing a value in the data scaled between the max and min boundaries of the data. Values are clamped to 0 and 1.
 * @param {Number} numEdges - Number of parts that makes up this scale
 */
function limitFunction(scaledValue, numParts) {
  /*
   *	Color-Scale doesn't calculate exact color blends based of the scaled value. It instead shifts the value inwards to achieve
   *	a better color representation at the edges. Primarily this is done to allow setting custom limits to where each color begins
   *	and ends. If a color begins and ends at 1, it should not be visible. The simplest way to achieve this is to remove 1 and 0
   *	from the possible numbers that can be used. Colors that are not equal to 1 or 0 should not be affected.
   */

  // The following is done to keep the scaled value above 0 and below 1. This shifts values that hits an exact boundary upwards.
  // eslint-disable-next-line no-param-reassign
  scaledValue = Math.min(Math.max(scaledValue, 0.000000000001), 0.999999999999);
  return numParts - scaledValue * numParts;
}

function getLevel(scale, level) {
  return Math.min(level || scale.startLevel, scale.colorParts.length - 1);
}

class ColorScale {
  constructor(nanColor) {
    this.colorParts = [];
    this.startLevel = 0;
    this.max = 1;
    this.min = 0;
    this.nanColor = createColor(nanColor);
  }

  /**
   * Adds a part to this color scale. The input colors span one part of the gradient, colors between them are interpolated. Input two equal colors for a solid scale part.
   * @ignore
   * @param {String|Number} color1 - First color to be used, in formats defined by Color
   * @param {String|Number} color2 - Second color to be used, in formats defined by Color
   * @param {Number} level - Which level of the color pyramid to add this part to.
   */
  addColorPart(color1, color2, level) {
    // eslint-disable-next-line no-param-reassign
    level = level || 0;
    this.startLevel = Math.max(level, this.startLevel);
    if (!this.colorParts[level]) {
      this.colorParts[level] = [];
    }
    this.colorParts[level].push([createColor(color1), createColor(color2)]);
  }

  /**
   * Gets the color which represents the input value
   * @ignore
   * @param {Number} scaledValue - A value between 0 and 1 representing a value in the data scaled between the max and min boundaries of the data. Values are clamped to 0 and 1.
   */
  getColor(value, level) {
    const scaledValue = value - this.min;
    if (Number.isNaN(+value) || Number.isNaN(+scaledValue)) {
      return this.nanColor;
    }
    // eslint-disable-next-line no-param-reassign
    level = getLevel(this, level);
    const k = limitFunction(scaledValue, this.colorParts[level].length);
    let f = Math.floor(k);
    f = f === k ? f - 1 : f; // To fulfill equal or greater than: 329-<330
    const part = this.colorParts[level][f];
    const c1 = part[0];
    const c2 = part[1];

    // For absolute edges we return the colors at the limit
    if (value === this.min) {
      return c2;
    }
    if (value === this.max) {
      return c1;
    }

    const t = k - f;
    const uc = getBlendedColor(c1, c2, t);
    return uc;
  }
}

export default ColorScale;
