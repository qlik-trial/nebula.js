import React, { useState } from 'react';
import extend from 'extend';
import ListBoxPopover from './ListBoxPopover';

const DEFAULTS = {
  show: true,
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'center',
  },
};

export const getOptions = (usersOptions = {}) => {
  const squashedOptions = {
    ...DEFAULTS,
  };
  extend(true, squashedOptions, usersOptions);
  return squashedOptions;
};

export default function ListBoxPopoverWrapper({ app, fieldIdentifier, stateName, element, options = {} }) {
  const [showState, setShowstate] = useState(!!options.show);
  const handleCloseShowState = () => {
    setShowstate(false);
    if (options.onPopoverClose) {
      options.onPopoverClose();
    }
  };

  return (
    <ListBoxPopover
      show={showState}
      app={app}
      alignTo={{ current: element }}
      anchorOrigin={options.anchorOrigin}
      transformOrigin={options.transformOrigin}
      close={handleCloseShowState}
      fieldName={fieldIdentifier}
      stateName={stateName}
      autoFocus={options.autoFocus}
      components={options.components}
      sortCriteria={options.sortCriteria}
    />
  );
}
