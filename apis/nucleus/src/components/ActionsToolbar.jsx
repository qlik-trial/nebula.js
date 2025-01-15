import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';

import { styled } from '@mui/material/styles';

import { Grid, Divider, Popover } from '@mui/material';

import { more as moreIcon } from '@nebula.js/ui/icons/more';
import { useTheme } from '@nebula.js/ui/theme';

import Item from './ActionsToolbarItem';
import useDefaultSelectionActions from '../hooks/useDefaultSelectionActions';
import InstanceContext from '../contexts/InstanceContext';
import More from './ActionsToolbarMore';
import getActionsKeyDownHandler from './actions-toolbar-keydown';

const PREFIX = 'ActionsToolbar';

const classes = {
  item: `${PREFIX}-item`,
  itemSpacing: `${PREFIX}-itemSpacing`,
};

const StyledPopover = styled(Popover)(({ theme }) => ({
  [`& .${classes.itemSpacing}`]: {
    padding: theme.spacing(0, 0.25),
  },
}));

/**
 * @interface
 * @extends HTMLElement
 * @since 2.1.0
 */
const ActionToolbarElement = {
  /** @type {'njs-action-toolbar-popover'} */
  className: 'njs-action-toolbar-popover',
};

const ActionsGroup = React.forwardRef(
  ({ className, ariaExpanded = false, actions = [], addAnchor = false, isRtl = false }, ref) =>
    actions.length > 0 ? (
      <Grid item container gap={0} flexDirection={isRtl ? 'row-reverse' : 'row'} wrap="nowrap" className={className}>
        {actions.map((e, ix) => (
          <Grid item key={e.key} className={`${classes.itemSpacing} ${classes.item}`}>
            <Item ariaExpanded={ariaExpanded} key={e.key} item={e} ref={ix === 0 ? ref : null} addAnchor={addAnchor} />
          </Grid>
        ))}
      </Grid>
    ) : null
);

const popoverStyle = { pointerEvents: 'none' };
const popoverTransformOrigin = {
  vertical: 'bottom',
  horizontal: 'right',
};

function ActionsToolbar({
  show = true,
  actions = [],
  maxItems = 3,
  selections = {
    show: false,
    api: null,
    onConfirm: () => {},
    onCancel: () => {},
  },
  extraItems,
  more = {
    enabled: false,
    actions: [],
    alignTo: null,
    popoverProps: {},
    popoverPaperStyle: {},
    disablePortal: true,
  },
  popover = {
    show: false,
    anchorEl: null,
  },
  focusHandler = null,
  actionsRefMock = null, // for testing
  isRtl,
  autoConfirm = false,
  layout,
}) {
  const defaultSelectionActions = useDefaultSelectionActions({ ...selections, layout });

  const { translator, keyboardNavigation } = useContext(InstanceContext);
  const [showMoreItems, setShowMoreItems] = useState(false);

  const popoverAnchorOrigin = {
    vertical: 12,
    horizontal: (popover.anchorEl?.clientWidth ?? 0) - 7,
  };

  const actionsRef = useRef();
  const moreRef = useRef();
  const theme = useTheme();
  const dividerStyle = useMemo(() => ({ margin: theme.spacing(0.5, 0) }));

  const getEnabledButton = (last) => {
    const actionsElement = actionsRef.current || actionsRefMock;
    if (!actionsElement) return null;
    const buttons = actionsElement.querySelectorAll('button:not(.Mui-disabled)');
    return buttons[last ? buttons.length - 1 : 0];
  };

  const handleActionsKeyDown = useMemo(
    () => getActionsKeyDownHandler({ keyboardNavigation, focusHandler, getEnabledButton, selections, isRtl }),
    [keyboardNavigation, focusHandler, getEnabledButton, selections, isRtl]
  );

  useEffect(
    () => () => {
      setShowMoreItems(false);
    },
    [popover.show, show, selections.show]
  );

  useEffect(() => {
    if (!focusHandler) return;

    const focusFirst = () => {
      const enabledButton = getEnabledButton(false);
      enabledButton?.focus();
    };
    const focusLast = () => {
      const enabledButton = getEnabledButton(true);
      enabledButton?.focus();
    };
    focusHandler.on('focus_toolbar_first', focusFirst);
    focusHandler.on('focus_toolbar_last', focusLast);
  }, []);

  if (autoConfirm) {
    return undefined;
  }

  let moreEnabled = more.enabled;
  let moreActions = more.actions;
  const moreAlignTo = more.alignTo || moreRef;
  const newActions = actions.filter((a) => !a.hidden);
  if (newActions.length > maxItems) {
    const newMoreActions = newActions.splice(-(newActions.length - maxItems) - 1);
    moreEnabled = true;
    moreActions = [...newMoreActions, ...more.actions];
  }

  if (!selections.show && newActions.length === 0 && !moreEnabled) return null;

  const handleCloseShowMoreItems = () => {
    setShowMoreItems(false);
  };

  const moreItem = {
    key: 'more',
    label: translator.get('Menu.More'), // TODO: Add translation
    getSvgIconShape: moreIcon,
    hidden: false,
    active: showMoreItems,
    enabled: () => moreEnabled,
    action: () => setShowMoreItems(!showMoreItems),
  };

  const showActions = newActions.length > 0;
  const showMore = moreActions.length > 0;
  const showDivider = (showActions && selections.show) || (showMore && selections.show);

  const Actions = (
    <Grid
      ref={actionsRef}
      onKeyDown={handleActionsKeyDown}
      container
      gap={0}
      wrap="nowrap"
      id="actions-toolbar"
      data-testid="actions-toolbar"
      sx={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
    >
      {extraItems?.length && (
        <ActionsGroup className="actions-toolbar-extra-actions" actions={extraItems} isRtl={isRtl} />
      )}
      {showActions && <ActionsGroup actions={newActions} />}
      {showMore && (
        <ActionsGroup
          id="actions-toolbar-show-more"
          data-testid="actions-toolbar-show-more"
          ref={moreRef}
          ariaExpanded={showMoreItems}
          actions={[moreItem]}
          addAnchor
        />
      )}
      {showDivider && (
        <Grid item className={classes.itemSpacing} style={dividerStyle}>
          <Divider orientation="vertical" />
        </Grid>
      )}
      {selections.show && (
        <ActionsGroup className="actions-toolbar-default-actions" actions={defaultSelectionActions} isRtl={isRtl} />
      )}
      {showMoreItems && (
        <More
          show={showMoreItems}
          actions={moreActions}
          alignTo={moreAlignTo}
          popoverProps={more.popoverProps}
          popoverPaperStyle={more.popoverPaperStyle}
          onCloseOrActionClick={handleCloseShowMoreItems}
          disablePortal={more.disablePortal}
        />
      )}
    </Grid>
  );

  return popover.show ? (
    <StyledPopover
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      open={popover.show}
      anchorEl={popover.anchorEl}
      anchorOrigin={popoverAnchorOrigin}
      transformOrigin={popoverTransformOrigin}
      hideBackdrop
      style={popoverStyle}
      onMouseDown={(e) => {
        e.stopPropagation(); // prevent click through, closing when it should not
      }}
      slotProps={{
        paper: {
          id: 'njs-action-toolbar-popover',
          'data-testid': 'njs-action-toolbar-popover',
          className: ActionToolbarElement.className,
          style: {
            pointerEvents: 'auto',
            padding: theme.spacing(0.5, 0.25),
          },
        },
      }}
    >
      {Actions}
    </StyledPopover>
  ) : (
    show && Actions
  );
}

export default ActionsToolbar;
