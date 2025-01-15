import React from 'react';

import { styled } from '@mui/material/styles';

import { Popover, MenuList, MenuItem, ListItemIcon, Typography } from '@mui/material';

import SvgIcon from '@nebula.js/ui/icons/SvgIcon';

import useActionState from '../hooks/useActionState';

const PREFIX = 'More';

const ActionsToolbarMoreElement = {
  className: 'njs-action-toolbar-more',
};

const classes = {
  icon: `${PREFIX}-icon`,
};

const StyledPopover = styled(Popover)(({ theme }) => ({
  // Set here to allow clicking through the modals container
  pointerEvents: 'none',
  [`& .${classes.icon} *`]: {
    color: theme.palette.text.primary,
  },
}));

function MoreItem({ item, autoFocus, onActionClick = () => {} }) {
  const { hidden, disabled, hasSvgIconShape } = useActionState(item);

  const handleClick = () => {
    item.action();
    onActionClick();
  };
  return !hidden ? (
    <MenuItem autoFocus={autoFocus} title={item.label} onClick={handleClick} disabled={disabled} tabindex="0">
      {hasSvgIconShape && <ListItemIcon className={classes.icon}>{SvgIcon(item.getSvgIconShape())}</ListItemIcon>}
      <Typography noWrap>{item.label}</Typography>
    </MenuItem>
  ) : null;
}

const More = React.forwardRef(
  (
    {
      actions = [],
      show = true,
      alignTo,
      popoverProps = {},
      popoverPaperStyle = {},
      onCloseOrActionClick = () => {},
      disablePortal = true,
    },
    ref
  ) => {
    const showActions = actions.length > 0;
    const autoFocusIndex = actions.findIndex((action) => !action.disabled);

    return (
      showActions && (
        <StyledPopover
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...popoverProps}
          onClose={onCloseOrActionClick}
          ref={ref}
          open={show}
          anchorEl={alignTo.current}
          getContentAnchorEl={disablePortal ? null : undefined}
          container={disablePortal ? alignTo.current : undefined}
          disablePortal={disablePortal}
          hideBackdrop
          transitionDuration={0}
          slotProps={{
            root: {
              className: ActionsToolbarMoreElement.className,
            },
            paper: {
              style: {
                pointerEvents: 'auto',
                maxWidth: '250px',
                ...popoverPaperStyle,
              },
            },
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuList id="moreMenuList">
            {actions.map((item, ix) => (
              // eslint-disable-next-line react/no-array-index-key
              <MoreItem key={ix} item={item} autoFocus={ix === autoFocusIndex} onActionClick={onCloseOrActionClick} />
            ))}
          </MenuList>
        </StyledPopover>
      )
    );
  }
);

export default More;
