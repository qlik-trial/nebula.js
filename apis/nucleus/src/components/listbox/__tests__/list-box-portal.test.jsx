import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ListBoxPortal, { getOptions } from '../ListBoxPortal';
import * as ListBoxInlineModule from '../ListBoxInline';
import * as useObjectSelectionsMockModule from '../../../hooks/useObjectSelections';
import * as useExistingModelModule from '../hooks/useExistingModel';
import * as useOnTheFlyModelMockModule from '../hooks/useOnTheFlyModel';
import * as getFrequencyModeLetterModule from '../utils/get-frequency-mode-letter';

jest.mock('react-dom', () => ({
  createPortal: (element) => element,
}));

describe('ListBoxPortal', () => {
  let testRenderer;
  let ListBoxInlineMock;
  let useObjectSelectionsMock;
  let useExistingModel;
  let useOnTheFlyModelMock;
  let getFrequencyModeLetterMock;

  async function render(content) {
    await renderer.act(async () => {
      testRenderer = renderer.create(content);
    });
    return testRenderer;
  }

  beforeEach(() => {
    jest.useFakeTimers();

    ListBoxInlineMock = jest.fn().mockImplementation(({ options }) => <div>{options.model.id}</div>);
    useObjectSelectionsMock = jest.fn().mockReturnValue([{ id: 'objectSelection' }]);
    useExistingModel = jest.fn().mockReturnValue({});
    useOnTheFlyModelMock = jest.fn().mockReturnValue({});
    getFrequencyModeLetterMock = jest.fn((v) => (v === 'percent' ? 'P' : 'N'));

    jest.spyOn(ListBoxInlineModule, 'default').mockImplementation(ListBoxInlineMock);
    jest.spyOn(useObjectSelectionsMockModule, 'default').mockImplementation(useObjectSelectionsMock);
    jest.spyOn(useExistingModelModule, 'default').mockImplementation(useExistingModel);
    jest.spyOn(useOnTheFlyModelMockModule, 'default').mockImplementation(useOnTheFlyModelMock);
    jest.spyOn(getFrequencyModeLetterModule, 'default').mockImplementation(getFrequencyModeLetterMock);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should run create portal with `uid()`', () => {
    const createPortalMock = jest.fn();
    jest.spyOn(ReactDOM, 'createPortal').mockImplementation(createPortalMock);

    const app = {};
    const fieldIdentifier = { qLibraryId: '123' };
    const element = document.createElement('div');
    const options = { selectionsApi: {}, sessionModel: {} };
    ListBoxPortal({ app, element, fieldIdentifier, options });

    expect(createPortalMock).toHaveBeenCalledTimes(1);
    expect(createPortalMock).toHaveBeenCalledWith(expect.anything(), expect.any(HTMLDivElement), expect.any(String));
  });

  describe('existing generic object', () => {
    test('should get object from app and use as model', async () => {
      const qId = '1337';
      const app = {};
      const [elem] = ListBoxPortal({ app, qId });
      await render(elem);
      expect(useExistingModel).toHaveBeenCalledWith({
        app,
        qId,
        options: {
          frequencyMode: undefined,
        },
      });
    });

    test('should use provided "sessionModel"', async () => {
      const app = {};
      const options = { sessionModel: {} };
      const [elem] = ListBoxPortal({ app, options });
      await render(elem);
      expect(useExistingModel).toHaveBeenCalledWith({
        app,
        options: { sessionModel: options.sessionModel },
        qId: undefined,
      });
    });
  });

  describe('on the fly', () => {
    test('should create session model when providing field name', async () => {
      const fieldIdentifier = 'Alpha';
      const app = {};
      const [elem] = ListBoxPortal({ app, fieldIdentifier });
      await render(elem);
      expect(useOnTheFlyModelMock).toHaveBeenCalledWith({
        app,
        fieldIdentifier,
        stateName: '$',
        options: {
          frequencyMode: 'N',
        },
      });
    });

    test('should create session model when providing qLibraryId', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const app = {};
      const [elem] = ListBoxPortal({ app, fieldIdentifier });
      await render(elem);
      expect(useOnTheFlyModelMock).toHaveBeenCalledWith({
        app,
        fieldIdentifier,
        stateName: '$',
        options: {
          frequencyMode: 'N',
        },
      });
    });
  });

  describe('internal selections Api', () => {
    test('should get selections from useObjectSelections hook', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const app = {};
      const options = { sessionModel: {} };
      const elementRef = {
        current: undefined,
      };
      const [elem] = ListBoxPortal({ app, fieldIdentifier, options });
      await render(elem);
      expect(useObjectSelectionsMock).toHaveBeenCalledWith(
        app,
        options.sessionModel,
        [elementRef, '.njs-action-toolbar-more', '.njs-action-toolbar-popover'],
        options
      );
    });
  });

  describe('external selections Api', () => {
    test('should pass in provided selectionApi as "selections" into ListBoxInline', async () => {
      const fieldIdentifier = { qLibraryId: '123' };
      const app = {};
      const usedSelectionsApi = { id: '321' };
      const notUsedSelectionsApi = { id: 'not used' };
      const options = {
        selectionsApi: usedSelectionsApi,
        sessionModel: {},
        app: {},
        model: {},
        selections: notUsedSelectionsApi,
      };
      const [elem] = ListBoxPortal({ app, fieldIdentifier, options });
      await render(elem);
      expect(ListBoxInlineMock).toHaveBeenCalledWith(
        {
          options: {
            ...options,
            selections: usedSelectionsApi,
          },
        },
        {}
      );
    });
  });

  describe('getOptions()', () => {
    let defaultValues;

    beforeAll(() => {
      defaultValues = {
        update: undefined,
        fetchStart: undefined,
        showGray: true,
        focusSearch: false,
        sessionModel: undefined,
        selectionsApi: undefined,
        selectDisabled: undefined,
        postProcessPages: undefined,
        calculatePagesHeight: false,
      };
    });

    test('should return default result', () => {
      expect(getOptions()).toMatchObject(defaultValues);
    });

    test('should return extra options result', () => {
      const extraOptions = {
        option_one: '#01',
        option_two: '#02',
      };
      expect(getOptions(extraOptions)).toMatchObject({ ...defaultValues, ...extraOptions });
    });

    test('should include options from `__DO_NOT_USE__` key', () => {
      const doNotUse = { do_not_use_one: 'do not use this key' };
      const extraOptions = {
        option_one: '#01',
        option_two: '#02',
        __DO_NOT_USE__: doNotUse,
      };
      const { __DO_NOT_USE__, ...resultOfOptions } = extraOptions;
      expect(getOptions(extraOptions)).toMatchObject({ ...defaultValues, ...resultOfOptions, ...doNotUse });
    });

    test('for onTheFly models it should consolidate frequency mode option just before transferring options to ListBoxInline, but not before that', async () => {
      expect(getOptions({ frequencyMode: 'percent' })).toMatchObject({ ...defaultValues, frequencyMode: 'percent' });
      expect(getOptions({ frequencyMode: 'values' })).toMatchObject({ ...defaultValues, frequencyMode: 'values' });

      const fieldIdentifier = { qLibraryId: '123' };
      const app = {};
      const options = {
        app: {},
        model: {},
        frequencyMode: 'percent',
      };
      const [elem] = ListBoxPortal({ app, fieldIdentifier, options });
      await render(elem);
      expect(ListBoxInlineMock.mock.calls[0][0]).toMatchObject(
        {
          options: {
            frequencyMode: 'P',
          },
        },
        {}
      );
    });
  });
});
