import { createColor } from 'qlik-chart-modules';

/**
 * @interface Theme~ScalePalette
 * @property {string} key
 * @property {'gradient'|'class-pyramid'} type
 * @property {string[]|Array<Array<string>>} colors
 */

/**
 * @interface Theme~DataPalette
 * @property {string} key
 * @property {'pyramid'|'row'} type
 * @property {string[]|Array<Array<string>>} colors
 */

/**
 * @interface Theme~ColorPickerPalette
 * @property {string} key
 * @property {string[]} colors
 */

export default function theme(resolvedTheme) {
  let uiPalette;

  return {
    dataScales() {
      const pals = [];
      resolvedTheme.scales.forEach((s) => {
        pals.push({
          key: s.propertyValue,
          name: s.name,
          translation: s.translation,
          scheme: true, // indicate that this is scheme that can be used to generate more colors
          type: s.type, // gradient, class, pyramid, row
          colors: s.scale,
        });
      });

      return pals;
    },
    dataPalettes() {
      const pals = [];
      resolvedTheme.palettes.data.forEach((s) => {
        pals.push({
          key: s.propertyValue,
          name: s.name,
          translation: s.translation,
          type: s.type,
          colors: s.scale,
        });
      });

      return pals;
    },
    uiPalettes() {
      const pals = [];
      resolvedTheme.palettes.ui.forEach((s) => {
        pals.push({
          key: 'ui',
          name: s.name,
          translation: s.translation,
          type: 'row',
          colors: s.colors,
        });
      });
      return pals;
    },
    dataColors() {
      /** @interface Theme~DataColorSpecials */
      return /** @lends Theme~DataColorSpecials */ {
        /** @type {string} */
        primary: resolvedTheme.dataColors.primaryColor,
        /** @type {string} */
        nil: resolvedTheme.dataColors.nullColor,
        /** @type {string} */
        others: resolvedTheme.dataColors.othersColor,
      };
    },
    uiColor(c, shift) {
      const indexIsValid = typeof c?.index === 'number' && !Number.isNaN(c?.index);
      const colorIsValid = typeof c?.color === 'string';
      const somethingIsValid = indexIsValid || colorIsValid;
      if (!somethingIsValid) {
        return undefined;
      }
      const getColor = () => {
        // eslint-disable-next-line no-param-reassign
        shift = !!shift;
        if (c?.index < 0 || typeof c?.index === 'undefined') {
          return c.color;
        }
        if (typeof uiPalette === 'undefined') {
          uiPalette = this.uiPalettes()[0] || false;
        }
        if (!uiPalette) {
          return c.color;
        }
        if (typeof uiPalette.colors[c.index - shift] === 'undefined') {
          return c.color;
        }
        return uiPalette.colors[c.index - shift];
      };
      const color = getColor();
      if (c.alpha === undefined || c.alpha >= 1 || c.alpha < 0) {
        return color;
      }
      const rgbaColor = createColor(color);
      rgbaColor.setAlpha(c.alpha);
      if (rgbaColor.isInvalid()) {
        return color;
      }
      return rgbaColor.getRGBA();
    },
  };
}
