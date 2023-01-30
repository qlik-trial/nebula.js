/* eslint object-property-newline:0 */
import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import * as MUIModule from '@mui/material';
import * as NebulaThemeModule from '@nebula.js/ui/theme';
import MountAppSelection, { AppSelections } from '../AppSelections';
import * as SelectedFieldsModule from '../SelectedFields';
import * as NavModule from '../Nav';
import * as useAppSelectionsModule from '../../../hooks/useAppSelections';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Grid: jest.fn(),
}));

jest.mock('@nebula.js/ui/theme', () => ({
  ...jest.requireActual('@nebula.js/ui/theme'),
  createTheme: jest.fn(),
  createGenerateClassName: jest.fn(),
}));

describe('<AppSelections />', () => {
  let api;
  let createPortalMock;

  beforeEach(() => {
    jest.spyOn(MUIModule, 'Grid').mockImplementation(({ children }) => <g>{children}</g>);
    jest.spyOn(NebulaThemeModule, 'createTheme').mockImplementation(() => ({}));
    jest.spyOn(NebulaThemeModule, 'createGenerateClassName').mockImplementation(() => () => 'gen');
    jest.spyOn(SelectedFieldsModule, 'default').mockImplementation(() => <sf />);
    jest.spyOn(NavModule, 'default').mockImplementation(() => <nav />);

    jest.spyOn(useAppSelectionsModule, 'default').mockReturnValue(['something']);
    createPortalMock = jest.fn();

    api = {
      canGoForward: () => 'canGoForward',
      canGoBack: () => 'canGoBack',
      canClear: () => 'canClear',
      layout: () => null,
      back: jest.fn(),
      forward: jest.fn(),
      clear: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  test('should render a toolbar', () => {
    api.canGoBack = () => false;
    const r = renderer.create(<AppSelections api={api} />);

    expect(r.toJSON()).toEqual({
      type: 'g',
      props: {},
      children: [
        {
          type: 'g',
          props: {},
          children: [
            {
              type: 'nav',
              props: {},
              children: null,
            },
          ],
        },
        {
          type: 'g',
          props: {},
          children: [
            {
              type: 'sf',
              props: {},
              children: null,
            },
          ],
        },
      ],
    });
  });

  test('should run create portal with `uid()`', () => {
    jest.spyOn(ReactDOM, 'createPortal').mockImplementation(createPortalMock);
    MountAppSelection({ element: document.createElement('div'), app: {} });
    expect(createPortalMock).toHaveBeenCalledTimes(1);
    expect(createPortalMock).toHaveBeenCalledWith(expect.anything(), expect.any(HTMLDivElement), expect.any(String));
  });
});
