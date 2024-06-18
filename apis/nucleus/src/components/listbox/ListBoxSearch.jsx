import React, { useContext, useState, useEffect } from 'react';
import { useTheme } from '@nebula.js/ui/theme';
import { InputAdornment, OutlinedInput, IconButton } from '@mui/material';
import Search from '@nebula.js/ui/icons/search';
import Close from '@nebula.js/ui/icons/close';

import InstanceContext from '../../contexts/InstanceContext';

const TREE_PATH = '/qListObjectDef';

export default function ListBoxSearch({ model, keyboard, dense = false, visible = true }) {
  const { translator } = useContext(InstanceContext);
  const [value, setValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const theme = useTheme();
  const clearSearchText = translator.get('Listbox.Clear.Search');

  const abortSearch = async () => {
    await model.abortListObjectSearch(TREE_PATH);
    setIsSearching(false);
  };

  useEffect(() => {
    if (!visible && isSearching) {
      abortSearch();
    }
  }, [visible]);

  const onClearSearch = () => {
    abortSearch();
    setValue('');
  };

  const onChange = (e) => {
    setValue(e.target.value);
    if (e.target.value.length === 0) {
      abortSearch();
    } else {
      model.searchListObjectFor(TREE_PATH, e.target.value);
      setIsSearching(true);
    }
  };
  const onKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        // Maybe we only want to accept if isSearching is true
        model.acceptListObjectSearch(TREE_PATH, true);
        setValue('');
        break;
      case 'Escape':
        onClearSearch();
        break;
      default:
        break;
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <OutlinedInput
      startAdornment={
        <InputAdornment position="start">
          <Search size={dense ? 'small' : 'normal'} />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position="end" sx={{ marginRight: '-8px' }}>
          {value !== '' && (
            <IconButton title={clearSearchText} aria-label={clearSearchText} onClick={onClearSearch}>
              <Close size={dense ? 'small' : 'normal'} />
            </IconButton>
          )}
        </InputAdornment>
      }
      className="search"
      sx={[
        {
          border: 'none',
          borderRadius: 0,
          '& fieldset': {
            border: `1px solid ${theme.palette.divider}`,
            borderWidth: '1px 0 1px 0',
            borderRadius: 0,
          },
          '&:hover': {
            border: 'none',
          },
        },
        dense && {
          fontSize: 12,
          paddingLeft: theme.spacing(1),
          '& input': {
            paddingTop: '5px',
            paddingBottom: '5px',
          },
        },
      ]}
      size="small"
      fullWidth
      placeholder={translator.get('Listbox.Search')}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      inputProps={{
        tabIndex: keyboard && (!keyboard.enabled || keyboard.active) ? 0 : -1,
      }}
    />
  );
}
