import Nuked from '../index';
import { getOptions } from '../components/listbox/ListBoxPortal';
import * as appLocaleModule from '../locale/app-locale';
import * as NebulaAppModule from '../components/NebulaApp';
import * as AppSelectionsModule from '../components/selections/AppSelections';
import * as createSessionObjectModule from '../object/create-session-object';
import * as getObjectModule from '../object/get-object';
import * as typesModule from '../sn/types';
import * as flagsModule from '../flags/flags';
import * as appThemeModule from '../app-theme';
import * as deviceTypeModule from '../device-type';

describe('nucleus', () => {
  let createObjectMock;
  let getObjectMock;
  let appThemeFnMock;
  let setThemeMock;
  let deviceTypeFnMock;
  let rootAppMock;
  let translator;
  let translatorAddMock;
  let translatorLanguageMock;
  let typesFnMock;

  beforeEach(() => {
    createObjectMock = jest.fn().mockReturnValue('created object');
    getObjectMock = jest.fn().mockReturnValue('got object');
    setThemeMock = jest.fn();
    appThemeFnMock = jest.fn().mockReturnValue({ externalAPI: 'internal', setTheme: setThemeMock });
    deviceTypeFnMock = jest.fn().mockReturnValue('desktop');
    rootAppMock = jest.fn().mockReturnValue([{}]);
    translatorAddMock = jest.fn();
    translatorLanguageMock = jest.fn();
    translator = { add: translatorAddMock, language: translatorLanguageMock, hi: 'hi' };
    typesFnMock = jest.fn().mockReturnValue({ getList: jest.fn() });

    // TODO:
    // this is not being mocked for no reason that i'm awared of:
    jest.spyOn(appLocaleModule, 'default').mockImplementation(() => ({ translator }));
    jest.spyOn(NebulaAppModule, 'default').mockImplementation(rootAppMock);
    jest.spyOn(AppSelectionsModule, 'default').mockImplementation(() => ({}));
    jest.spyOn(createSessionObjectModule, 'default').mockImplementation(createObjectMock);
    jest.spyOn(getObjectModule, 'default').mockImplementation(getObjectMock);
    jest.spyOn(typesModule, 'create').mockImplementation(typesFnMock);
    jest.spyOn(flagsModule, 'default').mockImplementation(() => 'flags');
    jest.spyOn(appThemeModule, 'default').mockImplementation(appThemeFnMock);
    jest.spyOn(deviceTypeModule, 'default').mockImplementation(deviceTypeFnMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('should merge Listbox options as expected', () => {
    test('should give correct defaults', () => {
      const squashedOptions = getOptions();
      expect(squashedOptions).toEqual({
        fetchStart: undefined,
        showGray: true,
        update: undefined,
        focusSearch: false,
        selectDisabled: undefined,
        selectionsApi: undefined,
        sessionModel: undefined,
        calculatePagesHeight: false,
        postProcessPages: undefined,
      });
    });

    test('should override defaults', () => {
      const update = () => {};
      const fetchStart = (arg) => {
        arg();
      };

      const squashedOptions = getOptions({
        __DO_NOT_USE__: {
          fetchStart,
          showGray: undefined,
          update,
        },
      });
      expect(squashedOptions).toEqual({
        fetchStart,
        showGray: undefined,
        update,
        focusSearch: false,
        selectDisabled: undefined,
        selectionsApi: undefined,
        sessionModel: undefined,
        calculatePagesHeight: false,
        postProcessPages: undefined,
      });
    });

    test('should not allow sneaking in non-exposed options as normal options', () => {
      const squashedOptions = getOptions({
        showGray: false,
        fetchStart: 'hey hey',
        update: 'nope',
      });
      expect(squashedOptions).toEqual({
        fetchStart: undefined,
        showGray: true,
        update: undefined,
        focusSearch: false,
        selectDisabled: undefined,
        selectionsApi: undefined,
        sessionModel: undefined,
        calculatePagesHeight: false,
        postProcessPages: undefined,
      });
    });
  });

  test('should initiate types with a public galaxy interface', () => {
    Nuked('app', {
      hostConfig: 'HOST',
      anything: {
        some: 'thing',
      },
    });
    const { galaxy } = typesFnMock.mock.lastCall[0].halo.public;
    expect(galaxy).toEqual({
      anything: {
        some: 'thing',
      },
      flags: 'flags',
      deviceType: 'desktop',
      hostConfig: 'HOST',
      translator,
    });
  });

  test('should wait for theme before rendering object', async () => {
    jest.useFakeTimers();
    let waited = false;
    const delay = 1000;
    appThemeFnMock.mockReturnValue({
      setTheme: () =>
        new Promise((resolve) => {
          setTimeout(() => {
            waited = true;
            resolve();
          }, delay);
        }),
    });

    const nuked = Nuked();
    const prom = nuked.render({});
    jest.advanceTimersByTime(delay + 100);
    const c = await prom;
    expect(waited).toBe(true);
    expect(c).toBe('created object');
  });

  test('should initite root app with context', () => {
    Nuked('app');
    expect(rootAppMock.mock.lastCall[0]).toMatchObject({
      app: 'app',
      context: {
        constraints: {},
        deviceType: 'auto',
        disableCellPadding: false,
        keyboardNavigation: false,
        language: 'en-US',
        theme: 'light',
        translator: {
          add: expect.any(Function),
          language: expect.any(Function),
        },
      },
    });
  });

  test('should only update context when property is known and changed', async () => {
    const rootContextMock = jest.fn();
    const root = { context: rootContextMock };
    const theme = { setTheme: setThemeMock };

    rootAppMock.mockReturnValue([root]);
    appThemeFnMock.mockReturnValue(theme);

    const nuked = Nuked('app');
    expect(rootContextMock).toHaveBeenCalledTimes(0);

    nuked.context({ foo: 'a' });
    expect(rootContextMock).toHaveBeenCalledTimes(0);

    nuked.context({ constraints: 'a' });
    expect(rootContextMock).toHaveBeenCalledTimes(1);

    nuked.context({ language: 'sv-SE' });
    expect(rootContextMock).toHaveBeenCalledTimes(2);
    // expect(translatorLanguageMock).toHaveBeenCalledWith('sv-SE');

    await nuked.context({ theme: 'sv-SE' });
    expect(rootContextMock).toHaveBeenCalledTimes(3);
    expect(setThemeMock).toHaveBeenCalledWith('sv-SE');
  });

  test('should avoid type duplication', () => {
    const nuked = Nuked.createConfiguration({ types: ['foo', 'bar', 'foo', 'foo', 'baz'] });
    expect(nuked.config.types).toEqual(['foo', 'bar', 'baz']);
  });

  test('should allow for default flags and overrides', () => {
    const defaultFlags = {
      KPI_REACTCOLORPICKER: true,
      IM_1869_HIDE_DIM_MEA_LINE: true,
      IM_1579_HIDE_DIM_MEA: true,
      CLIENT_IM_3365: true,
    };
    const nuked = Nuked.createConfiguration({ flags: { foo: true } });
    expect(nuked.config.flags).toEqual({
      foo: true,
      ...defaultFlags,
    });

    const nuked2 = Nuked.createConfiguration({
      flags: { foo: true, KPI_REACTCOLORPICKER: false },
    });
    expect(nuked2.config.flags).toEqual({
      foo: true,
      ...defaultFlags,
      KPI_REACTCOLORPICKER: false,
    });
  });
});
