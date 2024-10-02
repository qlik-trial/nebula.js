import { createColor, getContrastingColor } from 'qlik-chart-modules';
import { resolveBgColor, resolveBgImage } from '../../../utils/style/styling-props';

export const DEFAULT_SELECTION_COLORS = {
  selected: '#00873D',
  alternative: '#E4E4E4',
  excluded: '#A9A9A9',
  selectedExcluded: '#A9A9A9',
  possible: '#FFFFFF',
};

const SUPPORTED_COMPONENTS = ['theme', 'selections'];

export function getOverridesAsObject(components = []) {
  // Currently supporting components "theme" and "selections".
  const overrides = {};
  components.forEach((c) => {
    const k = c?.key;
    if (SUPPORTED_COMPONENTS.includes(k)) {
      overrides[k] = c;
    }
  });

  return overrides;
}

function getSelectionColors({
  getColorPickerColor,
  theme,
  getListboxStyle,
  overrides,
  checkboxes,
  themeSelectionColorsEnabled,
}) {
  const componentContentTextColor = overrides.theme?.content?.fontColor;

  // color priority: layout.component > theme content color > MUI theme
  const desiredTextColor =
    getColorPickerColor(componentContentTextColor) ||
    getListboxStyle('content', 'color') ||
    theme.palette?.text.primary;

  const useContrastTextColor = !checkboxes && (overrides.theme?.content?.useContrastColor ?? true);

  const getSelectionThemeColor = (state) =>
    themeSelectionColorsEnabled ? getListboxStyle('', `dataColors.${state}`) : undefined;

  const componentSelectionColors = overrides.selections?.colors || {};

  const getSelectionStateColors = (state) => {
    const paletteState = state === 'selected' ? 'main' : state;
    const contrastState = `${state}Contrast`;
    // color priority: layout.component > theme dataColors > theme background (only for 'possible') > MUI theme > hardcoded default
    const color =
      getColorPickerColor(componentSelectionColors[state]) ||
      getSelectionThemeColor(state) ||
      (state === 'possible' && getListboxStyle('', 'backgroundColor')) ||
      theme.palette?.selected?.[paletteState] ||
      DEFAULT_SELECTION_COLORS[state];

    const contrastColor = useContrastTextColor
      ? getContrastingColor(color, desiredTextColor)
      : desiredTextColor || theme.palette?.selected[`${contrastState}Text}`];

    return { [state]: color, [contrastState]: contrastColor };
  };

  return {
    ...getSelectionStateColors('selected'),
    ...getSelectionStateColors('alternative'),
    ...getSelectionStateColors('excluded'),
    ...getSelectionStateColors('selectedExcluded'),
    ...getSelectionStateColors('possible'),
  };
}

function getBackgroundColor({ themeApi, themeOverrides }) {
  let color;
  const bgColor = themeOverrides?.background;
  if (!bgColor) {
    return color;
  }
  if (bgColor?.useExpression) {
    color = resolveBgColor({ bgColor }, themeApi, 'listBox');
  } else {
    color = themeApi.getColorPickerColor(bgColor?.color, false);
  }
  return color;
}

function getSearchColor(getListboxStyle) {
  const desiredTextColor = getListboxStyle('content', 'color');
  const color = getContrastingColor('#fff', desiredTextColor);
  return color;
}

function getSearchBGColor(bgCol, getListboxStyle) {
  const searchBgColorObj = createColor(getListboxStyle('', 'backgroundColor'));
  searchBgColorObj.setAlpha(0.7);
  return searchBgColorObj.isInvalid() ? bgCol : searchBgColorObj.getRGBA();
}

export default function getStyles({
  app,
  themeApi,
  theme,
  components = [],
  checkboxes = false,
  themeSelectionColorsEnabled = false,
}) {
  const overrides = getOverridesAsObject(components);
  const getListboxStyle = (path, prop) => themeApi.getStyle('object.listBox', path, prop);
  const getColorPickerColor = (c) => (c?.index > 0 || c?.color ? themeApi.getColorPickerColor(c, false) : undefined);

  const selections = getSelectionColors({
    getColorPickerColor,
    theme,
    getListboxStyle,
    overrides,
    checkboxes,
    themeSelectionColorsEnabled,
  });
  const themeOverrides = overrides.theme || {};

  const headerColor = getColorPickerColor(themeOverrides.header?.fontColor) || getListboxStyle('title.main', 'color');

  const bgComponentColor = getBackgroundColor({ themeApi, themeOverrides });

  const bgImage = themeOverrides.background?.image
    ? resolveBgImage({ bgImage: themeOverrides.background.image }, app)
    : undefined;

  const bgColor = bgComponentColor || getListboxStyle('', 'backgroundColor') || theme.palette.background.default;

  const searchBgColor = getSearchBGColor(bgColor, getListboxStyle);
  const searchColor = getSearchColor(getListboxStyle);

  const headerFontStyle = themeOverrides.header?.fontStyle || {};
  const contentFontStyle = themeOverrides.content?.fontStyle || {};

  // Ensure we only return falseValue when the component is used, and thus has a false value.
  const getWithFallback = (value, trueValue, falseValue) =>
    (value === true && trueValue) || (value === false && falseValue) || undefined;

  return {
    background: {
      backgroundColor: bgColor,
      backgroundImage: bgImage?.url && !bgImage?.url.startsWith('url(') ? `url('${bgImage.url}')` : undefined,
      backgroundRepeat: 'no-repeat',
      backgroundSize: bgImage?.size,
      backgroundPosition: bgImage?.pos,
    },
    header: {
      color: headerColor,
      fontSize: themeOverrides.header?.fontSize || getListboxStyle('title.main', 'fontSize'),
      fontFamily: themeOverrides.header?.fontFamily || getListboxStyle('title.main', 'fontFamily'),
      fontWeight:
        getWithFallback(headerFontStyle.bold, 'bold', 'normal') ||
        getListboxStyle('title.main', 'fontWeight') ||
        'bold',
      textDecoration: headerFontStyle.underline ? 'underline' : 'initial',
      fontStyle:
        getWithFallback(headerFontStyle.italic, 'italic', 'normal') ||
        getListboxStyle('title.main', 'fontStyle') ||
        'initial',
    },
    content: {
      backgroundColor: checkboxes ? undefined : selections.possible,
      color: selections.possibleContrast || getListboxStyle('content', 'color'),
      fontSize: themeOverrides.content?.fontSize || getListboxStyle('content', 'fontSize'),
      fontFamily: themeOverrides.content?.fontFamily || getListboxStyle('content', 'fontFamily'),
      fontWeight:
        getWithFallback(contentFontStyle.bold, 'bold', 'normal') ||
        getListboxStyle('content', 'fontWeight') ||
        'normal',
      textDecoration: contentFontStyle.underline ? 'underline' : 'initial',
      fontStyle:
        getWithFallback(contentFontStyle.italic, 'italic', 'normal') ||
        getListboxStyle('content', 'fontStyle') ||
        'initial',
    },
    search: {
      color: searchColor,
      borderColor: theme.palette.divider,
      highlightBorderColor: theme.palette.custom.focusBorder,
      backgroundColor: searchBgColor,
      backdropFilter: 'blur(8px)',
    },
    selections,
  };
}
