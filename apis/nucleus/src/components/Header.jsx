import React, { useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';

import { Grid, Tooltip, Typography } from '@mui/material';
import ActionsToolbar from './ActionsToolbar';
import useRect from '../hooks/useRect';

const PREFIX = 'Header';

const classes = {
  containerStyle: `${PREFIX}-containerStyle`,
  containerTitleStyle: `${PREFIX}-containerTitleStyle`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`&.${classes.containerStyle}`]: {
    flexGrow: 0,
  },

  [`&.${classes.containerTitleStyle}`]: {
    paddingBottom: theme.spacing(1),
  },
}));

const ITEM_WIDTH = 32;
const ITEM_SPACING = 4;
const DIVIDER = 1;
const NUMBER_OF_ITEMS = 6;
const MIN_WIDTH = (ITEM_WIDTH + ITEM_SPACING) * NUMBER_OF_ITEMS + DIVIDER + ITEM_SPACING;

/**
 * @interface
 * @extends HTMLElement
 * @since 2.0.0
 */
const CellTitle = {
  /** @type {'njs-cell-title'} */
  className: 'njs-cell-title',
};

/**
 * @interface
 * @extends HTMLElement
 * @since 2.0.0
 */
const CellSubTitle = {
  /** @type {'njs-cell-sub-title'} */
  className: 'njs-cell-sub-title',
};

function Header({ layout, sn, anchorEl, hovering, focusHandler, titleStyles = {} }) {
  const showTitle = layout.showTitles && !!layout.title;
  const showSubtitle = layout.showTitles && !!layout.subtitle;
  const showInSelectionActions = layout.qSelectionInfo && layout.qSelectionInfo.qInSelections;
  const [actions, setActions] = useState([]);

  const [containerRef, containerRect] = useRect();
  const [shouldShowPopoverToolbar, setShouldShowPopoverToolbar] = useState(false);

  useEffect(() => {
    if (!sn || !sn.component || !sn.component.isHooked) {
      return;
    }
    sn.component.observeActions((a) => {
      setActions([...a, ...((sn && sn.selectionToolbar && sn.selectionToolbar.items) || [])]);
    });
  }, [sn]);

  useEffect(() => {
    if (!containerRect) return;
    const { width } = containerRect;
    setShouldShowPopoverToolbar(width < MIN_WIDTH);
  }, [containerRect]);

  const showTitles = showTitle || showSubtitle;
  const cls = [classes.containerStyle, ...(showTitles ? [classes.containerTitleStyle] : [])];
  const showPopoverToolbar = (hovering || showInSelectionActions) && (shouldShowPopoverToolbar || !showTitles);
  const showToolbar = showTitles && !showPopoverToolbar && !shouldShowPopoverToolbar;

  const Toolbar = (
    <ActionsToolbar
      show={showToolbar}
      selections={{
        show: showInSelectionActions,
        api: sn.component.selections,
        onKeyDeactivate: focusHandler.refocusContent,
      }}
      actions={actions}
      popover={{ show: showPopoverToolbar, anchorEl }}
      focusHandler={focusHandler}
      layout={layout}
    />
  );

  return (
    <StyledGrid ref={containerRef} item container wrap="nowrap" className={cls.join(' ')}>
      <Grid item zeroMinWidth xs>
        <Grid container wrap="nowrap" direction="column">
          {showTitle && (
            <Tooltip title={layout.title}>
              <Typography variant="h6" noWrap className={CellTitle.className} style={titleStyles.main}>
                {layout.title}
              </Typography>
            </Tooltip>
          )}
          {showSubtitle && (
            <Tooltip title={layout.subtitle}>
              <Typography variant="body2" noWrap className={CellSubTitle.className} style={titleStyles.subTitle}>
                {layout.subtitle}
              </Typography>
            </Tooltip>
          )}
        </Grid>
      </Grid>
      <Grid item>{Toolbar}</Grid>
    </StyledGrid>
  );
}

export default Header;
