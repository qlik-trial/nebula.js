import React, { useContext, useCallback, useRef, useEffect, useState } from 'react';

import Lock from '@nebula.js/ui/icons/lock';
import Unlock from '@nebula.js/ui/icons/unlock';

import { IconButton, Popover, Grid } from '@mui/material';

import { useTheme } from '@nebula.js/ui/theme';
import useSessionModel from '../../hooks/useSessionModel';
import useLayout from '../../hooks/useLayout';

import ListBox from './ListBox';
import createListboxSelectionToolbar from './interactions/listbox-selection-toolbar';

import ActionsToolbar from '../ActionsToolbar';

import InstanceContext from '../../contexts/InstanceContext';

import ListBoxSearch from './components/ListBoxSearch';
import useObjectSelections from '../../hooks/useObjectSelections';
import createSelectionState from './hooks/selections/selectionState';
import getHasSelections from './assets/has-selections';
import getStyles from './assets/styling';
import useTempKeyboard from './components/useTempKeyboard';

export default function ListBoxPopover({
  alignTo,
  anchorOrigin = {
    vertical: 'bottom',
    horizontal: 'center',
  },
  transformOrigin = {
    vertical: 'top',
    horizontal: 'center',
  },
  show,
  close,
  app,
  fieldName,
  stateName = '$',
  autoFocus,
  components,
  checkboxes: checkboxesOption,
  selectDisabled = () => false,
  sortCriteria = [
    {
      qSortByState: 1,
      qSortByAscii: 1,
      qSortByNumeric: 1,
      qSortByLoadOrder: 1,
    },
  ],
}) {
  const isMasterDim = Boolean(fieldName?.qLibraryId);
  const open = show && Boolean(alignTo.current);
  const [listCount, setListCount] = useState(0);
  const theme = useTheme();
  const searchInputRef = useRef();
  const [model] = useSessionModel(
    {
      qInfo: {
        qType: 'njsListbox',
      },
      qListObjectDef: {
        qStateName: stateName,
        qShowAlternatives: true,
        qInitialDataFetch: [
          {
            qTop: 0,
            qLeft: 0,
            qWidth: 0,
            qHeight: 0,
          },
        ],
        qDef: {
          qSortCriterias: sortCriteria,
          qFieldDefs: isMasterDim ? undefined : [fieldName],
        },
        qLibraryId: isMasterDim ? fieldName.qLibraryId : undefined,
      },
    },
    app,
    fieldName,
    stateName
  );

  const lock = useCallback(() => {
    model.lock('/qListObjectDef');
  }, [model]);

  const unlock = useCallback(() => {
    model.unlock('/qListObjectDef');
  }, [model]);

  const { translator, themeApi, keyboardNavigation } = useContext(InstanceContext);
  const moreAlignTo = useRef();
  const containerRef = useRef();
  const [selections] = useObjectSelections(app, model, containerRef);
  const [layout] = useLayout(model);
  const [selectionState] = useState(() => createSelectionState({ selectDisabled }));
  const keyboard = useTempKeyboard({ containerRef, enabled: keyboardNavigation });
  const { checkboxes = checkboxesOption } = layout || {};

  const styles = getStyles({ themeApi, theme, components, checkboxes });

  useEffect(() => {
    if (selections && open) {
      if (!selections.isModal(model)) {
        selections.goModal('/qListObjectDef');
      }
    }
  }, [selections, open]);

  if (!model || !layout || !translator) {
    return null;
  }

  const isLocked = layout.qListObject.qDimensionInfo.qLocked === true;

  const popoverClose = (e, reason) => {
    const accept = reason !== 'escapeKeyDown';
    selections.noModal(accept);
    close();
  };

  const listboxSelectionToolbarItems = createListboxSelectionToolbar({
    layout,
    model,
    translator,
    selectionState,
    selections,
  });

  const onCtrlF = () => {
    searchInputRef.current.focus();
  };

  const hasSelections = getHasSelections(layout);

  return (
    <Popover
      className="listbox-container"
      open={open}
      onClose={popoverClose}
      anchorEl={alignTo.current}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          style: {
            minWidth: '250px',
          },
        },
      }}
      onKeyDown={(e) => (e.key === 'Enter' ? popoverClose(e) : undefined)}
    >
      <Grid container direction="column" gap={0} ref={containerRef}>
        <Grid item container style={{ padding: theme.spacing(1) }}>
          <Grid item>
            {isLocked ? (
              <IconButton onClick={unlock} disabled={!isLocked} size="large">
                <Lock title={translator.get('Listbox.Unlock')} />
              </IconButton>
            ) : (
              <IconButton onClick={lock} disabled={!hasSelections} size="large">
                <Unlock title={translator.get('Listbox.Lock')} />
              </IconButton>
            )}
          </Grid>
          <Grid item xs />
          <Grid item>
            <ActionsToolbar
              layout={layout}
              more={{
                enabled: !isLocked,
                actions: listboxSelectionToolbarItems,
                alignTo: moreAlignTo,
                popoverProps: {
                  elevation: 0,
                },
                popoverPaperStyle: {
                  boxShadow: '0 12px 8px -8px rgba(0, 0, 0, 0.2)',
                  minWidth: '250px',
                },
              }}
              selections={{
                show: true,
                api: selections,
                onConfirm: popoverClose,
                onCancel: () => popoverClose(null, 'escapeKeyDown'),
              }}
            />
          </Grid>
        </Grid>
        <Grid item xs>
          <div ref={moreAlignTo} />
          <Grid item>
            <ListBoxSearch
              ref={searchInputRef}
              popoverOpen={open}
              styles={styles}
              visible
              model={model}
              listCount={listCount}
              selections={selections}
              selectionState={selectionState}
              keyboard={{
                enabled: false,
                innerTabStops: true,
                focusSelection: keyboard.focusSelection,
              }}
              autoFocus={autoFocus ?? true}
            />
          </Grid>
          <ListBox
            model={model}
            app={app}
            layout={layout}
            selections={selections}
            selectionState={selectionState}
            direction="ltr"
            onSetListCount={(c) => setListCount(c)}
            onCtrlF={onCtrlF}
            styles={styles}
            keyboard={keyboard}
          />
        </Grid>
      </Grid>
    </Popover>
  );
}
