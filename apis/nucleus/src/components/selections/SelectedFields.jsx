import React, { useEffect, useState, useContext } from 'react';

import { Grid } from '@mui/material';

import { useTheme } from '@nebula.js/ui/theme';
import useCurrentSelectionsModel from '../../hooks/useCurrentSelectionsModel';
import useLayout from '../../hooks/useLayout';
import useRect from '../../hooks/useRect';
import InstanceContext from '../../contexts/InstanceContext';

import OneField from './OneField';
import MultiState from './MultiState';
import More from './More';

const MIN_WIDTH = 120;
const MIN_WIDTH_MORE = 72;

function getItems(layout) {
  if (!layout) {
    return [];
  }
  const fields = {};

  // There is one qSelectionObject for the default state $,
  // and an array of one qSelectionObject for each alternate state.
  function collectFields(qSelectionObject, state) {
    qSelectionObject.qSelections.forEach((selection) => {
      const name = selection.qField;
      let currentField = fields[name];
      if (currentField === undefined) {
        currentField = {
          name,
          label:
            selection.qDimensionReferences?.find((element) => element.qLabel)?.qLabel ||
            selection.qReadableName ||
            name,
          states: [],
          selections: [],
        };
        fields[name] = currentField;
      }
      currentField.states.push(state);
      currentField.selections.push(selection);
    });
  }
  if (layout.qSelectionObject) {
    collectFields(layout.qSelectionObject, '$');
  }
  if (layout.alternateStates) {
    layout.alternateStates.forEach((s) => collectFields(s.qSelectionObject, s.stateName));
  }
  return Object.keys(fields)
    .map((key) => fields[key])
    .filter((f) => !f.selections.some((s) => s.qIsHidden));
}

export default function SelectedFields({ api, app }) {
  const theme = useTheme();
  const [currentSelectionsModel] = useCurrentSelectionsModel(app);
  const [layout] = useLayout(currentSelectionsModel);
  const [state, setState] = useState({ items: [], more: [] });

  const { modalObjectStore } = useContext(InstanceContext).selectionStore;
  const [containerRef, containerRect] = useRect();
  const [maxItems, setMaxItems] = useState(0);

  const isInListboxPopover = () => {
    const { model } = modalObjectStore.get(app.id) || {};
    return model?.genericType === 'njsListbox';
  };

  useEffect(() => {
    if (!containerRect) return;
    const { width } = containerRect;
    const maxWidth = Math.floor(width) - MIN_WIDTH_MORE;
    const items = Math.floor(maxWidth / MIN_WIDTH);
    setMaxItems(items);
  }, [containerRect]);

  useEffect(() => {
    if (!app || !currentSelectionsModel || !layout || !maxItems) {
      return;
    }
    const items = getItems(layout);
    setState((currState) => {
      const newItems = items;
      // Maintain modal state in app selections
      if (isInListboxPopover() && newItems.length + 1 === currState.items.length) {
        const lastDeselectedField = currState.items.filter(
          (f1) => newItems.some((f2) => f1.name === f2.name) === false
        )[0];
        const { qField } = lastDeselectedField.selections[0];
        lastDeselectedField.selections = [{ qField }];
        const wasIx = currState.items.indexOf(lastDeselectedField);
        newItems.splice(wasIx, 0, lastDeselectedField);
      }
      let newMoreItems = [];
      if (maxItems < newItems.length) {
        newMoreItems = newItems.splice(maxItems - newItems.length);
      }
      return {
        items: newItems,
        more: newMoreItems,
      };
    });
  }, [app, currentSelectionsModel, layout, api.isInModal(), maxItems]);

  return (
    <Grid ref={containerRef} container gap={0} wrap="nowrap" style={{ height: '100%' }}>
      {state.items.map((s) => (
        <Grid
          item
          key={`${s.states.join('::')}::${s.name}`}
          style={{
            position: 'relative',
            maxWidth: '240px',
            minWidth: `${MIN_WIDTH}px`,
            background: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          {s.states.length > 1 ? <MultiState field={s} api={api} /> : <OneField field={s} api={api} />}
        </Grid>
      ))}
      {state.more.length > 0 && (
        <Grid
          item
          style={{
            position: 'relative',
            maxWidth: '98px',
            minWidth: `${MIN_WIDTH_MORE}px`,
            background: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          <More items={state.more} api={api} />
        </Grid>
      )}
    </Grid>
  );
}
