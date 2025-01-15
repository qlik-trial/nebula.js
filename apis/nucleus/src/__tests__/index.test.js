/* eslint-disable no-underscore-dangle */
import React from 'react';
import nuked from '../index';
import * as NebulaAppModule from '../components/NebulaApp';
import * as appThemeModule from '../app-theme';
import * as ListBoxWrapperUtil from '../components/listbox/ListBoxPopoverWrapper';

describe('nuked()', () => {
  let rootAddMock;
  let rootRemoveMock;
  let rootMock;
  let setThemeMock;
  let rootAppMock;
  let appThemeFnMock;
  let getListboxPopoverOptionsMock;
  let reactCreateElementMock;
  let createdElement;

  let _nuked;

  beforeEach(() => {
    rootAddMock = jest.fn();
    rootRemoveMock = jest.fn();
    rootMock = {
      add: rootAddMock,
      remove: rootRemoveMock,
    };
    setThemeMock = jest.fn();
    rootAppMock = jest.fn().mockReturnValue([rootMock]);
    appThemeFnMock = jest.fn().mockReturnValue({ externalAPI: 'internal', setTheme: setThemeMock });
    getListboxPopoverOptionsMock = jest.fn();
    createdElement = document.createElement('span');
    createdElement.textContent = 'Here is your created element!';
    reactCreateElementMock = jest.fn().mockReturnValue(createdElement);

    jest.spyOn(appThemeModule, 'default').mockImplementation(appThemeFnMock);
    jest.spyOn(NebulaAppModule, 'default').mockImplementation(rootAppMock);
    jest.spyOn(ListBoxWrapperUtil, 'getOptions').mockImplementation(getListboxPopoverOptionsMock);
    jest.spyOn(React, 'createElement').mockImplementation(reactCreateElementMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('embed', () => {
    describe('__DO_NOT_USE__', () => {
      describe('popover', () => {
        let anchorElement;
        let fieldIdentifier;
        let options;
        let prevInstacne;
        let reactCreateElementExpectedArgs;

        beforeEach(() => {
          anchorElement = document.createElement('div');
          fieldIdentifier = 'field#01';
          options = { onPopoverClose: expect.any(Function) };
          prevInstacne = document.createElement('span');
          prevInstacne.textContent = 'Previously created Instance!';
          reactCreateElementExpectedArgs = [
            expect.any(Function),
            {
              app: undefined,
              element: anchorElement,
              fieldIdentifier,
              options,
              key: expect.any(String),
              stateName: '$',
            },
          ];
          getListboxPopoverOptionsMock.mockReturnValue(options);
        });

        test('should call `root.add()` at the first time of mounting properly', () => {
          _nuked = nuked();

          // first call -> nothing to remove
          _nuked.__DO_NOT_USE__.popover(anchorElement, fieldIdentifier, options);
          expect(rootRemoveMock).toHaveBeenCalledTimes(0);
          expect(getListboxPopoverOptionsMock).toHaveBeenCalledTimes(1);
          expect(getListboxPopoverOptionsMock).toHaveBeenCalledWith(options);
          expect(reactCreateElementMock).toHaveBeenCalledTimes(1);
          expect(reactCreateElementMock.mock.lastCall).toEqual(reactCreateElementExpectedArgs);
          expect(rootAddMock).toHaveBeenCalledTimes(1);
          expect(_nuked._popoverInstance).toEqual(createdElement);
        });

        test('should call `root.remove()` if instance has been created previously', () => {
          _nuked = nuked();

          // first calls root.remove()
          _nuked._popoverInstance = prevInstacne;
          _nuked.__DO_NOT_USE__.popover(anchorElement, fieldIdentifier, options);
          expect(rootRemoveMock).toHaveBeenCalledTimes(1);
          expect(rootRemoveMock).toHaveBeenCalledWith(prevInstacne);

          // then calls root.add() again
          expect(getListboxPopoverOptionsMock).toHaveBeenCalledTimes(1);
          expect(getListboxPopoverOptionsMock).toHaveBeenCalledWith(options);
          expect(reactCreateElementMock).toHaveBeenCalledTimes(1);
          expect(reactCreateElementMock.mock.lastCall).toEqual(reactCreateElementExpectedArgs);
          expect(rootAddMock).toHaveBeenCalledTimes(1);
          expect(_nuked._popoverInstance).toEqual(createdElement);
        });
      });
    });
  });
});
