import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ListBoxInline from './ListBoxInline';
import useObjectSelections from '../../hooks/useObjectSelections';
import useExistingModel from './hooks/useExistingModel';
import useOnTheFlyModel from './hooks/useOnTheFlyModel';
import identify from './assets/identify';
import uid from '../../object/uid';
import getFrequencyModeLetter from './utils/get-frequency-mode-letter';

/**
 * @ignore
 * @typedef {object} DoNotUseOptions Options strictly recommended not to use as they might change anytime. Documenting them to keep track of them, but not exposing them to API docs.
 * @property {boolean=} [focusSearch=false] Initialize the Listbox with the search input focused. Only applicable when
 *    search is true, since toggling will always focus the search input on show.
 * @property {boolean=} [options.showGray=true] Render fields or checkboxes in shades of gray instead of white when their state is excluded or alternative.
 * @property {boolean=} [options.calculatePagesHeight=false] Override each page's qHeight with its actual row count.
 * @property {object} [options.sessionModel] Use a custom sessionModel.
 * @property {object} [options.selectionsApi] Use a custom selectionsApi to customize how values are selected.
 * @property {function():boolean} [options.selectDisabled=] Define a function which tells when selections are disabled (true) or enabled (false). By default, always returns false.
 * @property {function():object[]} [options.postProcessPages] A function for client-side post-processing of returned pages.
 * @property {PromiseFunction} [options.fetchStart] A function called when the Listbox starts fetching data. Receives the fetch request promise as an argument.
 * @property {ReceiverFunction} [options.update] A function which receives an update function which upon call will trigger a data fetch.
 * @property {{setScrollPos:function(number):void, initScrollPos:number}} [options.scrollState=] Object including a setScrollPos function that sets current scroll position index. A initial scroll position index.
 * @property {function(number):void} [options.setCount=] A function that gets called with the length of the data in the Listbox.
 */

/**
 * @ignore
 * @param {object} usersOptions Options sent in to fieldInstance.mount.
 * @param {DoNotUseOptions} __DO_NOT_USE__
 * @returns {object} Squashed options with defaults given for non-exposed options.
 */
export const getOptions = (usersOptions = {}) => {
  const { __DO_NOT_USE__ = {}, ...exposedOptions } = usersOptions;

  const DO_NOT_USE_DEFAULTS = {
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
  const squashedOptions = {
    ...exposedOptions,
    ...DO_NOT_USE_DEFAULTS,
    // eslint-disable-next-line no-underscore-dangle
    ...__DO_NOT_USE__,
  };
  return squashedOptions;
};

const ListBoxWrapper = forwardRef(
  ({ app, fieldIdentifier, qId, stateName, element, initialOptions, renderedCallback }, ref) => {
    const [options, setOptions] = useState(initialOptions);
    const { isExistingObject, hasExternalSelectionsApi } = identify({ qId, options });

    if (!isExistingObject) {
      Object.assign(options, {
        frequencyMode: getFrequencyModeLetter(options.frequencyMode), // stick to letter option hereafter
      });
    }

    const [changeCount, setChangeCount] = useState(0);

    useEffect(() => {
      if (changeCount) {
        throw new Error('Source or selection Api can not change after a listbox has been mounted');
      }

      setChangeCount(changeCount + 1);
    }, [isExistingObject, hasExternalSelectionsApi]);

    const model = isExistingObject
      ? useExistingModel({ app, qId, options })
      : useOnTheFlyModel({ app, fieldIdentifier, stateName, options });

    const elementRef = useRef(element);

    const selections = hasExternalSelectionsApi
      ? options.selectionsApi
      : useObjectSelections(
          app,
          model,
          [elementRef, '.njs-action-toolbar-more', '.njs-action-toolbar-popover'],
          options
        )[0];

    const opts = useMemo(
      () => ({
        ...options,
        selections,
        model,
        app,
        renderedCallback,
      }),
      [options, selections, model, app]
    );

    useImperativeHandle(ref, () => ({ setOptions: (newOptions) => setOptions(newOptions) }), []);

    if (!selections || !model) {
      return null;
    }

    return <ListBoxInline options={opts} />;
  }
);

export default function ListBoxPortal({
  element,
  app,
  fieldIdentifier,
  qId,
  stateName = '$',
  options = {},
  renderedCallback,
}) {
  const listRef = React.createRef();
  const portal = ReactDOM.createPortal(
    <ListBoxWrapper
      ref={listRef}
      app={app}
      element={element}
      fieldIdentifier={fieldIdentifier}
      qId={qId}
      stateName={stateName}
      initialOptions={options}
      renderedCallback={renderedCallback}
    />,
    element,
    uid()
  );

  return [portal, listRef];
}
