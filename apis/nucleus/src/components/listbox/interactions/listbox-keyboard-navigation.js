import KEYS from '../../../keys';

const getElementIndex = (currentTarget) => +currentTarget.getAttribute('data-n');

export function getFieldKeyboardNavigation({
  select,
  selectAll,
  onCtrlF,
  confirm,
  cancel,
  setScrollPosition,
  focusListItems,
  keyboard,
  isModal,
}) {
  const getElement = (elm, next = false) => {
    const parentElm = elm && elm.parentElement[next ? 'nextElementSibling' : 'previousElementSibling'];
    return parentElm && parentElm.querySelector('[role]');
  };

  let startedRange = false;
  const setStartedRange = (val) => {
    startedRange = val;
  };

  const handleKeyDown = (event) => {
    let elementToFocus;
    const { currentTarget, nativeEvent } = event;
    const { keyCode, shiftKey = false, ctrlKey = false, metaKey = false } = nativeEvent;
    switch (keyCode) {
      case KEYS.TAB: {
        // Try to focus search field, otherwise confirm button.
        const searchField = currentTarget.closest('.listbox-container')?.querySelector('.search input');
        const inSelection = isModal();
        if (inSelection) {
          keyboard.focusSelection();
          break;
        }
        // Not in modal mode.
        if (shiftKey) {
          currentTarget.classList.add('last-focused'); // so that we can go back here when we tab back
          if (searchField) {
            searchField.focus();
          } else {
            currentTarget.setAttribute('tabIndex', '-1');
            const resetFocus = true; // focus the viz container
            keyboard.blur(resetFocus);
          }
        } else {
          currentTarget.setAttribute('tabIndex', '-1');
          currentTarget.blur();
          keyboard.blur();
        }
        break;
      }
      case KEYS.SHIFT:
        // This is to ensure we include the first value when starting a range selection.
        setStartedRange(true);
        break;
      case KEYS.SPACE:
        select([getElementIndex(currentTarget)]);
        break;
      case KEYS.ARROW_DOWN:
      case KEYS.ARROW_RIGHT:
        elementToFocus = getElement(currentTarget, true);
        if (shiftKey && elementToFocus) {
          if (startedRange) {
            select([getElementIndex(currentTarget)], true);
            setStartedRange(false);
          }
          select([getElementIndex(elementToFocus)], true);
        }
        break;
      case KEYS.ARROW_UP:
      case KEYS.ARROW_LEFT:
        elementToFocus = getElement(currentTarget, false);
        if (shiftKey && elementToFocus) {
          if (startedRange) {
            select([getElementIndex(currentTarget)], true);
            setStartedRange(false);
          }
          select([getElementIndex(elementToFocus)], true);
        }
        break;
      case KEYS.ENTER:
        confirm();
        break;
      case KEYS.ESCAPE:
        cancel();
        return; // let it propagate to top-level
      case KEYS.HOME:
        focusListItems.setFirst(true);
        if (ctrlKey) {
          setScrollPosition?.('overflowStart');
          break;
        }
        setScrollPosition?.('start');
        break;
      case KEYS.END:
        focusListItems.setLast(true);
        if (ctrlKey) {
          setScrollPosition?.('overflowEnd');
          break;
        }
        setScrollPosition?.('end');
        break;
      case KEYS.A:
        if (ctrlKey || metaKey) {
          selectAll();
          break;
        }
        return;
      case KEYS.F:
        if (ctrlKey || metaKey) {
          onCtrlF();
          break;
        }
        return;
      default:
        return; // don't stop propagation since we want to outsource keydown to other handlers.
    }
    if (elementToFocus) {
      elementToFocus.focus();
    }
    event.preventDefault();
    event.stopPropagation();
  };
  return handleKeyDown;
}

export function getListboxInlineKeyboardNavigation({
  keyboard,
  hovering,
  setHovering,
  updateKeyScroll,
  containerRef,
  currentScrollIndex,
  isModal,
  constraints,
}) {
  const blur = (event) => {
    const { target } = event;
    const isFocusedOnListbox = target.classList.contains('listbox-container');
    if (isFocusedOnListbox) {
      // Move the focus from listbox container to the viz container.
      keyboard.blur(true);
    } else {
      // Move focus from row to listbox container:

      // 1. Remove last-focused class from row siblings.
      const container = target.closest('.listbox-container');
      container?.querySelectorAll('.last-focused').forEach((elm) => {
        elm.classList.remove('last-focused');
      });

      // 2. Add last-focused class so we can re-focus it later.
      target.classList.add('last-focused');

      // 3. Blur row and focus the listbox container.
      target.setAttribute('tabIndex', '-1');
      keyboard.blur();
      target.closest('.listbox-container')?.focus();
    }
  };

  const updateKeyScrollOnHover = (newState) => {
    if (hovering) {
      updateKeyScroll(newState);
    }
  };

  const handleKeyDown = (event) => {
    const { keyCode, ctrlKey = false, shiftKey = false } = event.nativeEvent;

    switch (keyCode) {
      // case KEYS.TAB: TODO: Focus confirm button using keyboard.focusSelection when we can access the useKeyboard hook.
      case KEYS.ENTER:
      case KEYS.SPACE:
        if (!event.target.classList.contains('listbox-container')) {
          return; // don't mess with keydown handlers within the listbox
        }
        keyboard.focus();
        break;
      case KEYS.ESCAPE:
        blur(event);
        break;
      case KEYS.ARROW_UP:
        updateKeyScrollOnHover({ up: 1 });
        break;
      case KEYS.ARROW_DOWN:
        updateKeyScrollOnHover({ down: 1 });
        break;
      case KEYS.ARROW_LEFT:
      case KEYS.ARROW_RIGHT:
        return; // let it propagate to top-level
      case KEYS.PAGE_UP:
        updateKeyScrollOnHover({ up: currentScrollIndex.stop - currentScrollIndex.start });
        break;
      case KEYS.PAGE_DOWN:
        updateKeyScrollOnHover({ down: currentScrollIndex.stop - currentScrollIndex.start });
        break;
      case KEYS.HOME:
        updateKeyScrollOnHover({ scrollPosition: ctrlKey && shiftKey ? 'overflowStart' : 'start' });
        break;
      case KEYS.END:
        updateKeyScrollOnHover({ scrollPosition: ctrlKey && shiftKey ? 'overflowEnd' : 'end' });
        break;
      default:
        return;
    }

    // Note: We should not stop propagation here as it will block the containing app
    // from handling keydown events.
    event.preventDefault();
  };

  const focusOnHoverDisabled = () => {
    const selectNotAllowed = constraints?.select || constraints?.active;
    const appInModal = isModal();
    return selectNotAllowed || appInModal;
  };

  const handleOnMouseEnter = () => {
    if (!focusOnHoverDisabled()) {
      setHovering(true);
      containerRef?.current?.focus?.();
    }
  };

  const handleOnMouseLeave = () => {
    if (hovering) {
      setHovering(false);
      containerRef?.current?.blur?.();
    }
  };

  return { handleKeyDown, handleOnMouseEnter, handleOnMouseLeave };
}
