/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-import-assign */
/* eslint-disable array-callback-return */
/* eslint-disable import/first */
import React, { act } from 'react';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import * as unlockModule from '@nebula.js/ui/icons/unlock';
import * as lockModule from '@nebula.js/ui/icons/lock';
import { render as reactRender } from '@testing-library/react';
import ListBoxInline from '../ListBoxInline';
import * as InstanceContextModule from '../../../contexts/InstanceContext';
import * as useLayoutModule from '../../../hooks/useLayout';
import * as ActionsToolbarModule from '../../ActionsToolbar';
import * as ListBoxModule from '../ListBox';
import * as ListBoxSearchModule from '../components/ListBoxSearch';
import * as listboxSelectionToolbarModule from '../interactions/listbox-selection-toolbar';
import * as styling from '../assets/styling';
import * as isDirectQueryEnabled from '../utils/is-direct-query';

const virtualizedModule = require('react-virtualized-auto-sizer');
const listboxKeyboardNavigationModule = require('../interactions/keyboard-navigation/keyboard-nav-container');

jest.mock('react-virtualized-auto-sizer', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../interactions/keyboard-navigation/keyboard-nav-container', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('<ListboxInline />', () => {
  const app = { key: 'app' };

  let useState;
  let useEffect;
  let useCallback;
  let useRef;
  let model;
  let ActionsToolbar;
  let ListBoxSearch;
  let createListboxSelectionToolbar;
  let layout;
  let selections;
  let renderer;
  let render;
  let getListboxInlineKeyboardNavigation;
  let InstanceContext;
  let defaultOptions;

  beforeEach(() => {
    useState = jest.fn();
    useEffect = jest.fn();
    useCallback = jest.fn();
    useRef = jest.fn();

    jest.spyOn(React, 'useState').mockImplementation(useState);
    jest.spyOn(React, 'useEffect').mockImplementation(useEffect);
    jest.spyOn(React, 'useCallback').mockImplementation(useCallback);
    jest.spyOn(React, 'useRef').mockImplementation(useRef);

    model = {
      key: 'model',
      lock: jest.fn(),
      unlock: jest.fn(),
    };

    ActionsToolbar = jest.fn().mockReturnValue('ActionsToolbar');
    ListBoxSearch = jest.fn().mockReturnValue('ListBoxSearch');
    getListboxInlineKeyboardNavigation = jest.fn().mockReturnValue('keyboard-navigation');
    createListboxSelectionToolbar = jest.fn().mockReturnValue('actions');
    layout = {
      title: 'title',

      qListObject: {
        qDimensionInfo: {
          qFallbackTitle: 'qFallbackTitle',
          qLocked: false,
          qStateCounts: { qSelected: 2, qSelectedExcluded: 10, qLocked: 0, qLockedExcluded: 0 },
        },
      },
    };

    InstanceContext = React.createContext();
    InstanceContextModule.default = InstanceContext;

    jest.spyOn(virtualizedModule, 'default').mockImplementation(() => <div data-testid="virtualized-auto-sizer" />);
    jest.spyOn(unlockModule, 'default').mockImplementation(() => 'unlock');
    jest.spyOn(lockModule, 'default').mockImplementation(() => 'lock');
    jest.spyOn(useLayoutModule, 'default').mockImplementation(() => [layout]);
    jest.spyOn(listboxKeyboardNavigationModule, 'default').mockImplementation(getListboxInlineKeyboardNavigation);
    jest
      .spyOn(styling, 'default')
      .mockImplementation(() => ({ backgroundColor: '#FFFFFF', header: {}, content: {}, selections: {} }));
    jest.spyOn(isDirectQueryEnabled, 'default').mockImplementation(() => false);

    ActionsToolbarModule.default = ActionsToolbar;
    ListBoxModule.default = <div className="theListBox" />;
    ListBoxSearchModule.default = ListBoxSearch;
    listboxSelectionToolbarModule.default = createListboxSelectionToolbar;

    selections = {
      key: 'selections',
      isModal: jest.fn().mockReturnValue(false),
      isActive: () => 'isActive',
      on: jest.fn().mockImplementation((event, func) => (eventTriggered) => {
        if (event === eventTriggered) func();
      }),
      removeListener: jest.fn(),
    };

    defaultOptions = {
      app,
      title: 'title',
      direction: 'vertical',
      listLayout: 'vertical',
      search: true,
      focusSearch: false,
      toolbar: true,
      properties: {},
      model,
      selections,
      update: undefined,
      fetchStart: 'fetchStart',
      isPopover: false,
      components: [],
    };

    useRef.mockReturnValue({ current: 'current' });
    useState.mockImplementation((startValue) => [startValue, () => {}]);

    useEffect
      .mockImplementationOnce((effectFunc, watchArr) => {
        expect(watchArr[1].key).toBe('selections');
        effectFunc();
      })
      .mockImplementationOnce((effectFunc) => {
        effectFunc();
      });

    useCallback
      .mockImplementationOnce((effectFunc, watchArr) => {
        expect(watchArr).toHaveLength(0);
        return effectFunc;
      })
      .mockImplementationOnce((effectFunc, watchArr) => {
        expect(watchArr).toHaveLength(0);
        return effectFunc;
      });
  });

  afterEach(() => {
    renderer.unmount();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('Check rendering with different options', () => {
    beforeEach(() => {
      const theme = createTheme('dark');

      render = async (options = {}) => {
        const mergedOptions = { ...defaultOptions, ...options };
        await act(async () => {
          renderer = reactRender(
            <ThemeProvider theme={theme}>
              <InstanceContext.Provider value={{ translator: { get: (s) => s, language: () => 'sv' } }}>
                <ListBoxInline options={mergedOptions} />
              </InstanceContext.Provider>
            </ThemeProvider>
          );
        });
      };
    });

    test('should render with everything included', async () => {
      await render();
      const actionToolbars = await renderer.findAllByText('ActionsToolbar');
      expect(actionToolbars).toHaveLength(1);

      const typographs = await renderer.findAllByText('title');
      expect(typographs).toHaveLength(1);

      const autoSizers = await renderer.findAllByTestId('virtualized-auto-sizer');
      expect(autoSizers).toHaveLength(1);

      expect(ListBoxSearch.mock.calls[0][0]).toMatchObject({
        visible: true,
      });
      expect(getListboxInlineKeyboardNavigation).toHaveBeenCalledTimes(2);

      // TODO: MUIv5
      // expect(renderer.toJSON().props.onKeyDown).toBe('keyboard-navigation');

      expect(selections.on).toHaveBeenCalledTimes(2);
      expect(selections.on.mock.calls[0][0]).toBe('activated');
      expect(selections.on.mock.calls[1][0]).toBe('deactivated');
      expect(selections.removeListener).not.toHaveBeenCalled();
      expect(isDirectQueryEnabled.default).toHaveBeenCalled();
    });

    test('should render properly with search toggle option', async () => {
      const options = { search: 'toggle' };
      await render(options);

      const searchToggleBtns = await renderer.findAllByTestId('search-toggle-btn');
      expect(searchToggleBtns).toHaveLength(1);
      expect(ListBoxSearch.mock.calls[0][0]).toMatchObject({
        visible: false,
      });
    });

    test('should render without toolbar', async () => {
      const options = { toolbar: false };
      await render(options);
      const actionToolbars = await renderer.queryAllByText('ActionsToolbar');
      expect(actionToolbars).toHaveLength(0);

      const typographs = await renderer.queryAllByText('title');
      expect(typographs).toHaveLength(0);

      const listBoxSearches = await renderer.findAllByText('ListBoxSearch');
      expect(listBoxSearches).toHaveLength(1);
    });

    test('should render without toolbar', async () => {
      const options = { search: 'toggle' };
      await render(options);

      expect(ListBoxSearch.mock.calls[0][0]).toMatchObject({
        visible: false,
      });
      expect(selections.on).toHaveBeenCalledTimes(2);
      expect(selections.isModal).toHaveBeenCalledTimes(1);
      expect(selections.on.mock.calls[0][0]).toBe('activated');
      expect(selections.on.mock.calls[1][0]).toBe('deactivated');
    });

    test('should render without search and show search button', async () => {
      const options = { search: false };
      await render(options);
      const actionToolbars = await renderer.findAllByText('ActionsToolbar');
      expect(actionToolbars).toHaveLength(1);

      const typographs = await renderer.findAllByText('title');
      expect(typographs).toHaveLength(1);

      expect(ListBoxSearch.mock.calls[0][0]).toMatchObject({
        visible: false,
      });
    });

    test('should render with NOT autoFocus when search is true', async () => {
      const options = { search: true };
      await render(options);

      expect(ListBoxSearch.mock.calls[0][0]).toMatchObject({
        visible: true,
        autoFocus: false,
      });
    });

    test('should show toolbar when opened in a popover', async () => {
      const options = { search: false, isPopover: true };
      await render(options);
      const actionToolbars = await renderer.findAllByText('ActionsToolbar');
      expect(actionToolbars).toHaveLength(1);

      const typographs = await renderer.findAllByText('title');
      expect(typographs).toHaveLength(1);

      expect(ListBoxSearch.mock.calls[0][0]).toMatchObject({
        visible: false,
      });
      expect(selections.on).toHaveBeenCalledTimes(2);
      expect(selections.on.mock.calls[0][0]).toBe('activated');
      expect(selections.on.mock.calls[1][0]).toBe('deactivated');
    });

    test('should remove correct listeners on unmount', async () => {
      await render();

      const activatedFn = selections.on.mock.calls[0][1];
      const deactivatedFn = selections.on.mock.calls[1][1];

      renderer.unmount();

      expect(selections.removeListener).toHaveBeenCalledWith('activated', activatedFn);
      expect(selections.removeListener).toHaveBeenCalledWith('deactivated', deactivatedFn);
    });
  });
});
