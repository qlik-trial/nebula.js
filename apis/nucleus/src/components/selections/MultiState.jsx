import React, { useState, useContext, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Badge, IconButton, Grid, Typography, Popover, Button, List, ListItem, Box } from '@mui/material';
import DownArrow from '@nebula.js/ui/icons/down-arrow';

import OneField from './OneField';
import InstanceContext from '../../contexts/InstanceContext';

import ListBoxPopover from '../listbox/ListBoxPopover';

const PREFIX = 'MultiState';

const classes = {
  item: `${PREFIX}-item`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`&.${classes.item}`]: {
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    cursor: 'pointer',
    padding: '4px',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    height: '100%',
    alignItems: 'center',
  },
}));

export default function MultiState({ field, api, moreAlignTo = null, onClose = () => {} }) {
  // If originated from the `more` item show fields directly
  const [showFields, setShowFields] = useState(!!moreAlignTo);
  const [showStateIx, setShowStateIx] = useState(-1);
  // If originated from the `more` item align it
  const [anchorEl, setAnchorEl] = useState(moreAlignTo ? moreAlignTo.current : null);
  const alignTo = moreAlignTo || useRef();
  const { translator } = useContext(InstanceContext);
  const clearAllStates = translator.get('Selection.ClearAllStates');

  const handleShowFields = (e) => {
    if (e.currentTarget.contains(e.target)) {
      // because click in popover will propagate to parent
      setAnchorEl(e.currentTarget);
      alignTo.current = e.currentTarget;
      setShowFields(!showFields);
    }
  };

  const handleCloseShowFields = () => {
    setShowFields(false);
    onClose();
  };

  const handleShowState = (e, ix) => {
    e.stopPropagation();
    setShowFields(false);
    setShowStateIx(ix);
  };

  const handleCloseShowState = () => {
    setShowStateIx(-1);
    onClose();
  };

  const handleClearAllStates = () => {
    field.states.forEach((s) => api.clearField(field.name, s));
  };

  let Header = null;
  if (!moreAlignTo) {
    Header = (
      <>
        <Grid item xs zeroMinWidth>
          <Badge style={{ padding: '0px 8px' }} color="secondary" badgeContent={field.states.length}>
            <Typography component="span" noWrap style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 600 }}>
              {field.label}
            </Typography>
          </Badge>
        </Grid>
        <Grid item>
          <div style={{ width: '12px' }} />
        </Grid>
        <Grid item>
          <IconButton size="large">
            <DownArrow />
          </IconButton>
        </Grid>
      </>
    );
  }
  const Fields = (
    <List dense>
      <ListItem title={clearAllStates} onClick={handleClearAllStates}>
        <Button variant="contained" fullWidth>
          {clearAllStates}
        </Button>
      </ListItem>
      {field.states.map((s, ix) => (
        // eslint-disable-next-line react/no-array-index-key
        <ListItem key={ix} title={field.label} onClick={(e) => handleShowState(e, ix)}>
          <Box border={1} width="100%" borderRadius={1} borderColor="divider">
            <OneField field={field} api={api} stateIx={ix} skipHandleShowListBoxPopover />
          </Box>
        </ListItem>
      ))}
    </List>
  );
  const PopoverFields = (
    <Popover
      open={showFields}
      onClose={handleCloseShowFields}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        style: {
          minWidth: '200px',
          width: '200px',
          pointerEvents: 'auto',
        },
      }}
    >
      {Fields}
    </Popover>
  );

  const Component = moreAlignTo ? (
    PopoverFields
  ) : (
    <StyledGrid container gap={0} className={classes.item} onClick={handleShowFields}>
      {Header}
      {showFields && PopoverFields}
      {showStateIx > -1 && (
        <ListBoxPopover
          alignTo={alignTo}
          show={showStateIx > -1}
          close={handleCloseShowState}
          app={api.model}
          fieldName={field.selections[showStateIx].qField}
          stateName={field.states[showStateIx]}
        />
      )}
    </StyledGrid>
  );

  return moreAlignTo && showStateIx > -1 ? (
    <ListBoxPopover
      alignTo={alignTo}
      show={showStateIx > -1}
      close={handleCloseShowState}
      app={api.model}
      fieldName={field.selections[showStateIx].qField}
      stateName={field.states[showStateIx]}
    />
  ) : (
    Component
  );
}
