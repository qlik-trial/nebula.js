import React from 'react';
import Remove from '@nebula.js/ui/icons/remove';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router';
import { useRootContext } from '../../../contexts/RootContext';
import { checkIfHistoryConnectionDisabled } from '../../../utils';

const ConnectionHistory = () => {
  const navigate = useNavigate();
  const { info, setError, cachedConnectionsData } = useRootContext();

  const handleHistoryItemClick = (item) => {
    setError();
    navigate(`/app-list?engine_url=${item.replace('?', '&')}`);
  };

  if (!cachedConnectionsData.cachedConnections.length) return null;

  return (
    <Box mb={2}>
      <Typography variant="h6">Previous connections</Typography>
      <List>
        {cachedConnectionsData.cachedConnections.map((item) => (
          <ListItem
            button
            key={item}
            component="a"
            onClick={() => handleHistoryItemClick(item)}
            disabled={checkIfHistoryConnectionDisabled({ item, info })}
          >
            <ListItemText primary={item} />
            <ListItemSecondaryAction>
              <IconButton
                onClick={() => cachedConnectionsData.removeCachedConnection(item)}
                data-testid="close-btn"
                size="large"
                edge="end"
              >
                <Remove />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ConnectionHistory;
