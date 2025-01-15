/* eslint-disable no-param-reassign */
/* eslint-disable no-import-assign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import * as NebulaThemeModule from '@nebula.js/ui/theme';
import SelectedFields from '../SelectedFields';
import * as OneFieldModule from '../OneField';
import * as MultiStateModule from '../MultiState';
import * as MoreModule from '../More';
import * as useCurrentSelectionsModelModule from '../../../hooks/useCurrentSelectionsModel';
import * as useLayoutModule from '../../../hooks/useLayout';
import * as useRectModule from '../../../hooks/useRect';
import initSelectionStores from '../../../stores/new-selections-store';
import initializeStores from '../../../stores/new-model-store';
import InstanceContext from '../../../contexts/InstanceContext';

jest.mock('@nebula.js/ui/theme', () => ({
  ...jest.requireActual('@nebula.js/ui/theme'),
  useTheme: jest.fn(),
}));

describe('<SelectedFields />', () => {
  let currentSelectionsModel;
  let useLayout;
  let rect;
  let modalObjectStore;
  let render;
  let renderer;
  let OneField;
  let MultiState;
  let More;
  let context;
  const selectionsStoreModule = initSelectionStores('appId');
  const modelStore = initializeStores('appId');

  beforeEach(() => {
    currentSelectionsModel = {
      id: 'current-selections',
    };
    useLayout = jest.fn();
    modalObjectStore = {
      get: jest.fn().mockReturnValue(false),
      set: jest.fn(),
    };

    rect = { width: 900 };

    jest
      .spyOn(NebulaThemeModule, 'useTheme')
      .mockImplementation(() => ({ palette: { divider: 'red', background: { paper: 'pinky' } } }));

    OneField = jest.fn().mockImplementation(() => 'OneField');
    MultiState = jest.fn().mockImplementation(() => 'MultiState');
    More = jest.fn().mockImplementation(() => 'More');

    jest.spyOn(useLayoutModule, 'default').mockImplementation(useLayout);
    jest.spyOn(useRectModule, 'default').mockImplementation(() => [() => {}, rect]);
    jest.spyOn(useCurrentSelectionsModelModule, 'default').mockImplementation(() => [currentSelectionsModel]);

    selectionsStoreModule.modalObjectStore = modalObjectStore;

    OneFieldModule.default = OneField;
    MultiStateModule.default = MultiState;
    MoreModule.default = More;

    const defaultApp = {
      id: 'selected-fields',
    };
    const defaultApi = {
      isInModal: jest.fn().mockReturnValue(false),
    };

    context = {
      modelStore,
      selectionStore: selectionsStoreModule,
    };

    render = async ({ api = {}, app = {}, rendererOptions } = {}) => {
      api = {
        ...defaultApi,
        ...api,
      };
      app = {
        ...defaultApp,
        ...app,
      };
      await act(async () => {
        renderer = create(
          <InstanceContext.Provider value={context}>
            <SelectedFields api={api} app={app} />
          </InstanceContext.Provider>,
          rendererOptions || null
        );
      });
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    renderer.unmount();
  });

  test('should render `<OneField />`', async () => {
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field',
          },
        ],
      },
    };
    useLayout.mockReturnValue([data]);
    await render();
    expect(() => renderer.root.findByType(OneField)).not.toThrow();
    expect(() => renderer.root.findByType(MultiState)).toThrow();
  });

  test('should render `<MultiState />`', async () => {
    const data = {
      alternateStates: [
        {
          stateName: '$',
          qSelectionObject: {
            qSelections: [
              {
                qField: 'my-field',
              },
            ],
          },
        },
        {
          stateName: 'foo',
          qSelectionObject: {
            qSelections: [
              {
                qField: 'my-field',
              },
            ],
          },
        },
      ],
    };
    useLayout.mockReturnValue([data]);
    await render();
    expect(() => renderer.root.findByType(MultiState)).not.toThrow();
    expect(() => renderer.root.findByType(OneField)).toThrow();
  });

  test('should keep item in modal state', async () => {
    modalObjectStore.get.mockReturnValue({ model: { genericType: 'njsListbox' } });
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field0',
          },
          {
            qField: 'my-field1',
          },
          {
            qField: 'my-field2',
          },
          {
            qField: 'my-field3',
            qIsHidden: true,
          },
        ],
      },
    };
    const newData = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field0',
          },
          {
            qField: 'my-field2',
          },
          {
            qField: 'my-field3',
            qIsHidden: true,
          },
        ],
      },
    };
    useLayout
      .mockReturnValueOnce([data])
      .mockReturnValueOnce([data])
      .mockReturnValueOnce([newData])
      .mockReturnValueOnce([newData]);
    await render();
    const types = renderer.root.findAllByType(OneField);
    expect(types).toHaveLength(3);
    expect(types[0].props.field.name).toBe('my-field0');
    expect(types[1].props.field.name).toBe('my-field1');
    expect(types[2].props.field.name).toBe('my-field2');
  });

  test('should render `<More />`', async () => {
    rect = { width: 1 };
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field',
          },
        ],
      },
    };
    useLayout.mockReturnValue([data]);
    await render();
    renderer.root.findByType(More);
    expect(() => renderer.root.findByType(OneField)).toThrow();
    expect(() => renderer.root.findByType(MultiState)).toThrow();
  });

  test('should pass dimension label or `readable name` to the `<OneField />` rendering', async () => {
    const data = {
      qSelectionObject: {
        qSelections: [
          {
            qField: 'my-field0',
          },
          {
            qField: 'my-field1',
            qDimensionReferences: [{ qId: 'id-of-associated-dimension', qLabel: 'my-dim-label' }],
          },
          {
            qField: 'my-field2',
            qReadableName: 'my-readable-name',
          },
        ],
      },
    };
    useLayout.mockReturnValue([data]);
    await render();
    const oneFields = renderer.root.findAllByType(OneField);
    expect(oneFields[0].props.field.name).toBe('my-field0');
    expect(oneFields[0].props.field.label).toBe('my-field0');
    expect(oneFields[1].props.field.name).toBe('my-field1');
    expect(oneFields[1].props.field.label).toBe('my-dim-label');
    expect(oneFields[2].props.field.name).toBe('my-field2');
    expect(oneFields[2].props.field.label).toBe('my-readable-name');
  });
});
