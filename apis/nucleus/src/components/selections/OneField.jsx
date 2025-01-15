import React, { useRef, useState, useContext } from 'react';
import Remove from '@nebula.js/ui/icons/remove';
import Lock from '@nebula.js/ui/icons/lock';

import { IconButton, Grid, Typography } from '@mui/material';

import { useTheme } from '@nebula.js/ui/theme';

import ListBoxPopover from '../listbox/ListBoxPopover';

import InstanceContext from '../../contexts/InstanceContext';

export default function OneField({
  field,
  api,
  stateIx = 0,
  skipHandleShowListBoxPopover = false,
  moreAlignTo = null,
  onClose = () => {},
}) {
  const { translator } = useContext(InstanceContext);
  const alignTo = moreAlignTo || useRef();
  const theme = useTheme();
  const [showListBoxPopover, setShowListBoxPopover] = useState(false);

  const handleShowListBoxPopover = (e) => {
    if (e.currentTarget.contains(e.target)) {
      // because click in popover will propagate to parent
      setShowListBoxPopover(!showListBoxPopover);
    }
  };

  const handleCloseShowListBoxPopover = () => {
    setShowListBoxPopover(false);
    onClose();
  };

  const selection = field.selections[stateIx];
  if (typeof selection.qTotal === 'undefined') {
    selection.qTotal = 0;
  }
  const counts = selection.qStateCounts || {
    qSelected: 0,
    qLocked: 0,
    qExcluded: 0,
    qLockedExcluded: 0,
    qSelectedExcluded: 0,
    qAlternative: 0,
  };
  const green = (counts.qSelected + counts.qLocked) / selection.qTotal;
  const white = counts.qAlternative / selection.qTotal;
  const grey = (counts.qExcluded + counts.qLockedExcluded + counts.qSelectedExcluded) / selection.qTotal;

  const numSelected = counts.qSelected + counts.qSelectedExcluded + counts.qLocked + counts.qLockedExcluded;
  // Maintain modal state in app selections
  const noSegments = numSelected === 0 && selection.qTotal === 0;
  let label = '';
  if (selection.qTotal === numSelected && selection.qTotal > 1) {
    label = translator.get('CurrentSelections.All');
  } else if (numSelected > 1 && selection.qTotal) {
    label = translator.get('CurrentSelections.Of', [numSelected, selection.qTotal]);
  } else if (selection.qSelectedFieldSelectionInfo) {
    label = selection.qSelectedFieldSelectionInfo.map((v) => v.qName).join(', ');
  }
  if (field.states[stateIx] !== '$') {
    label = `${field.states[stateIx]}: ${label}`;
  }

  const segments = [
    { color: theme.palette.selected.main, ratio: green },
    { color: theme.palette.selected.alternative, ratio: white },
    { color: theme.palette.selected.excluded, ratio: grey },
  ];
  segments.forEach((s, i) => {
    s.offset = i ? segments[i - 1].offset + segments[i - 1].ratio : 0; // eslint-disable-line
  });

  let Header = null;
  let Icon = null;
  let SegmentsIndicator = null;
  let Component = null;
  if (!moreAlignTo) {
    Header = (
      <Grid item xs style={{ minWidth: 0, flexGrow: 1, opacity: selection.qLocked ? '0.3' : '' }}>
        <Typography noWrap style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 600 }}>
          {field.label}
        </Typography>
        <Typography noWrap style={{ fontSize: '12px', opacity: 0.55, lineHeight: '16px' }}>
          {label}
        </Typography>
      </Grid>
    );

    if (selection.qLocked) {
      Icon = (
        <Grid item>
          <IconButton size="large">
            <Lock />
          </IconButton>
        </Grid>
      );
    } else if (!selection.qOneAndOnlyOne) {
      Icon = (
        <Grid item>
          <IconButton
            title={translator.get('Selection.Clear')}
            onClick={(e) => {
              e.stopPropagation();
              api.clearField(selection.qField, field.states[stateIx]);
            }}
            size="large"
          >
            <Remove />
          </IconButton>
        </Grid>
      );
    }

    SegmentsIndicator = (
      <div
        style={{
          height: '4px',
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '100%',
        }}
      >
        {noSegments === false &&
          segments.map((s) => (
            <div
              key={s.color}
              style={{
                position: 'absolute',
                background: s.color,
                height: '100%',
                top: 0,
                width: `${s.ratio * 100}%`,
                left: `${s.offset * 100}%`,
              }}
            />
          ))}
      </div>
    );
    Component = (
      <Grid
        container
        gap={1}
        ref={alignTo}
        sx={{
          backgroundColor: theme.palette.background.paper,
          position: 'relative',
          cursor: 'pointer',
          padding: '4px',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        onClick={(skipHandleShowListBoxPopover === false && handleShowListBoxPopover) || null}
      >
        {Header}
        {Icon}
        {SegmentsIndicator}
        {showListBoxPopover && (
          <ListBoxPopover
            alignTo={alignTo}
            show={showListBoxPopover}
            close={handleCloseShowListBoxPopover}
            app={api.model}
            fieldName={selection.qField}
            stateName={field.states[stateIx]}
          />
        )}
      </Grid>
    );
  }
  return moreAlignTo ? (
    <ListBoxPopover
      alignTo={alignTo}
      show
      close={handleCloseShowListBoxPopover}
      app={api.model}
      fieldName={selection.qField}
      stateName={field.states[stateIx]}
    />
  ) : (
    Component
  );
}
