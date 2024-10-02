import theme from '@nebula.js/theme';
import {
  resolveBgColor,
  resolveBgImage,
  resolveTextStyle,
  resolveBorder,
  resolveBorderRadius,
  resolveBoxShadow,
} from '../styling-props';
import * as resolveProperty from '../resolve-property';
import * as resolveColor from '../resolve-color';
import * as shadowUtils from '../shadow-utils';

jest.mock('../resolve-property');
jest.mock('../resolve-color');
jest.mock('../shadow-utils');

describe('Styling property resolver', () => {
  describe('Background property resolver', () => {
    let bgCompLayout;

    const t = theme().externalAPI;

    const app = {
      session: {
        config: {
          url: 'wss://example.com/lots/of/paths',
        },
      },
    };

    beforeEach(() => {
      bgCompLayout = {
        key: 'general',
        bgColor: {
          useExpression: true,
          colorExpression: '#ff0000',
          color: { index: -1, color: 'aqua' },
        },
        bgImage: {
          mode: 'media',
          mediaUrl: {
            qStaticContentUrl: {
              qUrl: '/media/Tulips.jpg',
            },
          },
          position: 'top-left',
          sizing: 'alwaysFit',
        },
      };
    });

    test('should resolve background color to empty', () => {
      jest.spyOn(resolveColor, 'default').mockReturnValue('resolvedColor');
      const color = resolveBgColor({});
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(undefined, '', 'backgroundColor', undefined, undefined);
      expect(color).toBe('resolvedColor');
    });

    test('should resolve background color by expression', () => {
      jest.spyOn(resolveColor, 'default').mockReturnValue('resolvedColor');
      const color = resolveBgColor(bgCompLayout, t);
      expect(resolveColor.default).toHaveBeenCalledTimes(0);
      expect(color).toBe('rgb(255,0,0)');
    });

    test('should resolve background color by picker', () => {
      jest.spyOn(resolveColor, 'default').mockReturnValue('resolvedColor');
      bgCompLayout.bgColor.useExpression = false;
      const color = resolveBgColor(bgCompLayout, t);
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(
        bgCompLayout.bgColor.color,
        '',
        'backgroundColor',
        t,
        undefined
      );
      expect(color).toBe('resolvedColor');
    });

    test('should resolve background color by expression using useColorExpression property', () => {
      jest.spyOn(resolveColor, 'default').mockReturnValue('resolvedColor');
      bgCompLayout.bgColor.useColorExpression = true;
      bgCompLayout.bgColor.useExpression = false;

      const color = resolveBgColor(bgCompLayout, t);
      expect(resolveColor.default).toHaveBeenCalledTimes(0);
      expect(color).toBe('rgb(255,0,0)');
    });

    test('should resolve background color by theme', () => {
      jest.spyOn(resolveColor, 'default').mockReturnValue('resolvedColor');
      const color = resolveBgColor({}, t, 'peoplechart');
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(undefined, '', 'backgroundColor', t, 'peoplechart');
      expect(color).toBe('resolvedColor');
    });

    test('should resolve background image https', () => {
      const { url, pos } = resolveBgImage(bgCompLayout, app);
      expect(url).toBe('https://example.com/media/Tulips.jpg');
      expect(pos).toBe('top left');
    });
    test('should resolve background image http', () => {
      app.session.config.url = 'ws://example.com/lots/of/paths';
      const { url, size } = resolveBgImage(bgCompLayout, app);
      expect(url).toBe('http://example.com/media/Tulips.jpg');
      expect(size).toBe('contain');
    });

    test('should resolve text style by props', () => {
      const prop = {
        title: {
          main: {
            color: { color: 'red' },
            fontFamily: 'familiiii',
            fontStyle: ['underline', 'italic'],
            fontSize: 'giant',
          },
        },
      };
      const style = resolveTextStyle(prop, 'main', t, 'peoplechart');
      expect(style).toEqual({
        color: 'red',
        fontFamily: 'familiiii',
        fontSize: 'giant',
        fontWeight: 'normal',
        fontStyle: 'italic',
        textDecoration: 'underline',
      });
    });

    test('should resolve text style by theme', () => {
      const prop = {
        title: {
          footer: {
            color: { color: 'red' },
            fontStyle: '',
            fontSize: '58em',
          },
        },
      };
      const style = resolveTextStyle(
        prop,
        'footer',
        {
          getStyle: (obj, path, attr) => {
            if (obj === 'object.peoplechart' && path === 'title.footer' && attr === 'fontFamily') {
              return 'a font';
            }
            return 'wrong';
          },
          getColorPickerColor: (color) => color.color,
        },
        'peoplechart'
      );

      expect(style).toEqual({
        color: 'red',
        fontFamily: 'a font',
        fontSize: '58em',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'initial',
      });
    });
  });

  describe('resolveBorder', () => {
    const comp = {};
    const styleService = {};
    const objectType = 'somechart';

    beforeEach(() => {
      comp.borderWidth = undefined;
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    test('should resolve border correctly if comp.borderWidth != undefined and resolved borderColor != undefined', () => {
      comp.borderWidth = '2px';
      jest.spyOn(resolveProperty, 'default').mockReturnValue('resolvedProperty');
      jest.spyOn(resolveColor, 'default').mockReturnValue('red');
      const res = resolveBorder(comp, styleService, objectType);
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(undefined, '', 'borderColor', styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(0);
      expect(res).toEqual('2px solid red');
    });

    test('should resolve border correctly if comp.borderWidth != undefined and resolved borderColor = undefined', () => {
      comp.borderWidth = '2px';
      jest.spyOn(resolveProperty, 'default').mockReturnValue('resolvedProperty');
      jest.spyOn(resolveColor, 'default').mockReturnValue(undefined);
      const res = resolveBorder(comp, styleService, objectType);
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(undefined, '', 'borderColor', styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(0);
      expect(res).toEqual(undefined);
    });

    test('should resolve border correctly if comp.borderWidth = undefined, resolved borderColor != undefined, and resolved borderWidth != undefined', () => {
      jest.spyOn(resolveProperty, 'default').mockReturnValue('5px');
      jest.spyOn(resolveColor, 'default').mockReturnValue('red');
      const res = resolveBorder(comp, styleService, objectType);
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(undefined, '', 'borderColor', styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(1);
      expect(resolveProperty.default).toHaveBeenCalledWith('', 'borderWidth', styleService, objectType);
      expect(res).toEqual('5px solid red');
    });

    test('should resolve border correctly if comp.borderWidth = undefined, resolved borderColor != undefined, and resolved borderWidth = undefined', () => {
      jest.spyOn(resolveProperty, 'default').mockReturnValue(undefined);
      jest.spyOn(resolveColor, 'default').mockReturnValue('red');
      const res = resolveBorder(comp, styleService, objectType);
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(undefined, '', 'borderColor', styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(1);
      expect(resolveProperty.default).toHaveBeenCalledWith('', 'borderWidth', styleService, objectType);
      expect(res).toEqual(undefined);
    });

    test('should resolve border correctly if comp.borderWidth = undefined, resolved borderColor = undefined, and resolved borderWidth != undefined', () => {
      jest.spyOn(resolveProperty, 'default').mockReturnValue('5px');
      jest.spyOn(resolveColor, 'default').mockReturnValue(undefined);
      const res = resolveBorder(comp, styleService, objectType);
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(undefined, '', 'borderColor', styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(1);
      expect(resolveProperty.default).toHaveBeenCalledWith('', 'borderWidth', styleService, objectType);
      expect(res).toEqual(undefined);
    });

    test('should resolve border correctly if comp.borderWidth = undefined, resolved borderColor = undefined, and resolved borderWidth = undefined', () => {
      jest.spyOn(resolveProperty, 'default').mockReturnValue(undefined);
      jest.spyOn(resolveColor, 'default').mockReturnValue(undefined);
      const res = resolveBorder(comp, styleService, objectType);
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(undefined, '', 'borderColor', styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(1);
      expect(resolveProperty.default).toHaveBeenCalledWith('', 'borderWidth', styleService, objectType);
      expect(res).toEqual(undefined);
    });
  });

  describe('resolveBorderRadius', () => {
    const comp = {};
    const styleService = {};
    const objectType = 'somechart';

    beforeEach(() => {
      comp.borderRadius = undefined;
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    test('should resolve border radius correctly if comp.borderRadius != undefined', () => {
      comp.borderRadius = '10px';
      jest.spyOn(resolveProperty, 'default').mockReturnValue('resolvedProperty');
      const res = resolveBorderRadius(comp, styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(0);
      expect(res).toEqual('10px');
    });

    test('should resolve border radius correctly if comp.borderRadius = undefined and resolved borderRadius != undefined', () => {
      jest.spyOn(resolveProperty, 'default').mockReturnValue('15px');
      const res = resolveBorderRadius(comp, styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(1);
      expect(resolveProperty.default).toHaveBeenCalledWith('', 'borderRadius', styleService, objectType);
      expect(res).toEqual('15px');
    });

    test('should resolve border radius correctly if comp.borderRadius = undefined and resolved borderRadius = undefined', () => {
      jest.spyOn(resolveProperty, 'default').mockReturnValue(undefined);
      const res = resolveBorderRadius(comp, styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(1);
      expect(resolveProperty.default).toHaveBeenCalledWith('', 'borderRadius', styleService, objectType);
      expect(res).toEqual(undefined);
    });
  });

  describe('resolveBoxShadow', () => {
    const comp = { shadow: {} };
    const styleService = {};
    const objectType = 'somechart';

    beforeEach(() => {
      comp.borderWidth = undefined;
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    test('should resolve box shadow correctly if comp?.shadow?.boxShadow != undefined', () => {
      comp.shadow.boxShadow = '3px 6px green';
      jest.spyOn(resolveProperty, 'default').mockReturnValue('themeBoxShadow');
      jest.spyOn(resolveColor, 'default').mockReturnValue('resolvedColor');
      jest.spyOn(shadowUtils, 'getFullBoxShadow').mockReturnValue('finalBoxShadow');
      const res = resolveBoxShadow(comp, styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(1);
      expect(resolveProperty.default).toHaveBeenCalledWith('shadow', 'boxShadow', styleService, objectType);
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(
        undefined,
        'shadow',
        'boxShadowColor',
        styleService,
        objectType
      );
      expect(shadowUtils.getFullBoxShadow).toHaveBeenCalledTimes(1);
      expect(shadowUtils.getFullBoxShadow).toHaveBeenCalledWith(
        comp.shadow.boxShadow,
        'themeBoxShadow',
        'resolvedColor'
      );
      expect(res).toEqual('finalBoxShadow');
    });

    test('should resolve box shadow correctly if comp?.shadow?.boxShadow = undefined', () => {
      jest.spyOn(resolveProperty, 'default').mockReturnValue('themeBoxShadow');
      jest.spyOn(resolveColor, 'default').mockReturnValue('resolvedColor');
      jest.spyOn(shadowUtils, 'getFullBoxShadow').mockReturnValue('finalBoxShadow');
      const res = resolveBoxShadow(comp, styleService, objectType);
      expect(resolveProperty.default).toHaveBeenCalledTimes(1);
      expect(resolveProperty.default).toHaveBeenCalledWith('shadow', 'boxShadow', styleService, objectType);
      expect(resolveColor.default).toHaveBeenCalledTimes(1);
      expect(resolveColor.default).toHaveBeenCalledWith(
        undefined,
        'shadow',
        'boxShadowColor',
        styleService,
        objectType
      );
      expect(shadowUtils.getFullBoxShadow).toHaveBeenCalledTimes(1);
      expect(shadowUtils.getFullBoxShadow).toHaveBeenCalledWith(
        comp.shadow.boxShadow,
        'themeBoxShadow',
        'resolvedColor'
      );
      expect(res).toEqual('finalBoxShadow');
    });
  });
});
