import * as EventEmitter from 'node-event-emitter';
import * as chartModules from 'qlik-chart-modules';
import * as setThemeModule from '../set-theme';
import * as paletterResolverFnModule from '../palette-resolver';
import * as styleResolverFnModule from '../style-resolver';
import * as contrasterFnModule from '../contraster';
import create from '../index';

jest.mock('node-event-emitter');

describe('theme', () => {
  let setThemeMock;
  let paletterResolverFnMock;
  let styleResolverFnMock;
  let contrasterFnMock;
  let luminanceFnMock;
  let emitter;
  let emitterEmitMock;
  let emitterInitMock;

  beforeEach(() => {
    setThemeMock = jest.fn();
    paletterResolverFnMock = jest.fn();
    styleResolverFnMock = jest.fn();
    contrasterFnMock = jest.fn();
    luminanceFnMock = jest.fn();
    emitterEmitMock = jest.fn();
    emitterInitMock = jest.fn();

    jest.spyOn(setThemeModule, 'default').mockImplementation(setThemeMock);
    jest.spyOn(paletterResolverFnModule, 'default').mockImplementation(paletterResolverFnMock);
    jest.spyOn(styleResolverFnModule, 'default').mockImplementation(styleResolverFnMock);
    styleResolverFnMock.resolveRawTheme = 'raw';
    jest.spyOn(contrasterFnModule, 'default').mockImplementation(contrasterFnMock);
    jest.spyOn(chartModules, 'getLuminance').mockImplementation(luminanceFnMock);
    emitter = {
      prototype: {
        emit: emitterEmitMock,
      },
      init: emitterInitMock,
    };

    EventEmitter.EventEmitter.mockReturnValue(emitter);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('initiate', () => {
    beforeEach(() => {
      setThemeMock.mockReturnValue('resolvedJSON');
      const getStyle = jest.fn().mockReturnValue('red');
      styleResolverFnMock.mockReturnValue({
        getStyle,
      });
    });

    test('should create paletteResolver', () => {
      create();
      expect(paletterResolverFnMock).toHaveBeenCalledWith('resolvedJSON');
    });

    test('should create contraster for dark text color', () => {
      luminanceFnMock.mockReturnValue(0.19);
      create();
      expect(contrasterFnMock).toHaveBeenCalledWith(['red', '#ffffff']);
    });

    test('should create contraster for light text color', () => {
      create();
      expect(contrasterFnMock).toHaveBeenCalledWith(['red', '#333333']);
    });

    test("should emit 'changed' event", () => {
      const t = create();
      expect(t.externalAPI.emit).toHaveBeenCalledTimes(1);
      expect(t.externalAPI.emit).toHaveBeenCalledWith('changed');
    });
  });

  describe('api', () => {
    let t;
    let resolved;
    beforeEach(() => {
      resolved = 'resolved';
      setThemeMock.mockReturnValue(resolved);
      paletterResolverFnMock.mockReturnValue({
        dataScales: () => 'p scales',
        dataPalettes: () => 'p data palettes',
        uiPalettes: () => `p ui palettes`,
        dataColors: () => 'p data colors',
        uiColor: (a) => `p ui ${a}`,
      });
      styleResolverFnMock.mockReturnValue({
        getStyle: () => '#eeeeee',
      });
      contrasterFnMock.mockReturnValue({ getBestContrastColor: (c) => `contrast ${c}` });
      t = create().externalAPI;
    });

    test('getDataColorScales()', () => {
      expect(t.getDataColorScales()).toBe('p scales');
    });

    test('getDataColorPalettes()', () => {
      expect(t.getDataColorPalettes()).toBe('p data palettes');
    });

    test('getDataColorPickerPalettes()', () => {
      expect(t.getDataColorPickerPalettes()).toBe('p ui palettes');
    });

    test('getDataColorSpecials()', () => {
      expect(t.getDataColorSpecials()).toBe('p data colors');
    });

    test('getColorPickerColor()', () => {
      expect(t.getColorPickerColor('color')).toBe('p ui color');
    });

    test('getContrastingColorTo()', () => {
      expect(t.getContrastingColorTo('color')).toBe('contrast color');
    });

    test('getStyle()', () => {
      const getStyle = jest.fn();
      getStyle.mockReturnValue('style');
      styleResolverFnMock.mockReturnValue({
        getStyle,
      });
      expect(t.getStyle('base', 'path', 'attribute')).toBe('style');

      // calling additional getStyle with same params should use cached style resolver
      expect(styleResolverFnMock).toHaveBeenCalledTimes(2);
      t.getStyle('base', 'path', 'attribute');
      t.getStyle('base', 'path', 'attribute');
      t.getStyle('base', 'path', 'attribute');
      expect(styleResolverFnMock).toHaveBeenCalledTimes(2);
    });
  });
});
