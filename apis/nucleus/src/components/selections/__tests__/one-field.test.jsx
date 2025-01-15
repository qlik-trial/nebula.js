/* eslint react/jsx-no-constructed-context-values: 0 */
/* eslint-disable no-import-assign */
import React from 'react';
import renderer from 'react-test-renderer';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import { IconButton, Typography } from '@mui/material';
import OneField from '../OneField';
import * as InstanceContextModule from '../../../contexts/InstanceContext';

describe('<OneField />', () => {
  let InstanceContext;
  const theme = createTheme('dark');
  const create = (component) => renderer.create(<ThemeProvider theme={theme}>{component}</ThemeProvider>);

  beforeEach(() => {
    InstanceContext = React.createContext();
    InstanceContextModule.default = InstanceContext;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.resetAllMocks();
  });

  test('should have `ALL`', () => {
    const field = {
      label: 'my-field',
      selections: [
        {
          qField: 'my-field',
          qTotal: 12,
          qStateCounts: {
            qSelected: 3,
            qLocked: 3,
            qExcluded: 0,
            qLockedExcluded: 3,
            qSelectedExcluded: 3,
            qAlternative: 0,
          },
        },
      ],
      states: ['$'],
    };
    const testRenderer = create(
      <InstanceContext.Provider value={{ translator: { get: () => 'ALL' } }}>
        <OneField field={field} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(Typography);
    expect(types).toHaveLength(2);
    expect(types[0].props).toEqual({
      noWrap: true,
      style: { fontSize: '12px', lineHeight: '16px', fontWeight: 600 },
      children: 'my-field',
    });
    expect(types[1].props).toEqual({
      noWrap: true,
      style: { fontSize: '12px', opacity: 0.55, lineHeight: '16px' },
      children: 'ALL',
    });
  });
  test('should have `Of`', () => {
    const field = {
      label: 'my-field',
      selections: [
        {
          qField: 'my-field',
          qTotal: 13,
          qStateCounts: {
            qSelected: 3,
            qLocked: 3,
            qExcluded: 0,
            qLockedExcluded: 3,
            qSelectedExcluded: 3,
            qAlternative: 0,
          },
        },
      ],
      states: ['$'],
    };
    const testRenderer = create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Of' } }}>
        <OneField field={field} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(Typography);
    expect(types).toHaveLength(2);
    expect(types[0].props).toEqual({
      noWrap: true,
      style: { fontSize: '12px', lineHeight: '16px', fontWeight: 600 },
      children: 'my-field',
    });
    expect(types[1].props).toEqual({
      noWrap: true,
      style: { fontSize: '12px', opacity: 0.55, lineHeight: '16px' },
      children: 'Of',
    });
  });
  test('should have a clear button', () => {
    const field = {
      selections: [
        {
          qField: 'my-field',
          qSelectedFieldSelectionInfo: [],
        },
      ],
      states: ['$'],
    };
    const testRenderer = create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Clear' } }}>
        <OneField field={field} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(IconButton);
    expect(types).toHaveLength(1);
    expect(types[0].props.title).toBe('Clear');
  });
  test('should have a lock button', () => {
    const field = {
      selections: [
        {
          qField: 'my-field',
          qLocked: true,
          qSelectedFieldSelectionInfo: [],
        },
      ],
      states: ['$'],
    };
    const testRenderer = create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Lock' } }}>
        <OneField field={field} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(IconButton);
    expect(types).toHaveLength(1);
  });
});
