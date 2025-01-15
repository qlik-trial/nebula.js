import React, { useState } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router';
import { useRootContext } from '../../../contexts/RootContext';
import { getFieldPlaceHolder, shouldDisableSubmitBtn } from '../../../utils';

import Error from './Error';

export default function FormManager({ info, fields, error, isCredentialProvided }) {
  const navigate = useNavigate();
  const { setError } = useRootContext();
  const [inputs, setInputs] = useState({});

  const handleUpdateInputs = (evt) => {
    setInputs({
      ...inputs,
      [evt.target.name]: evt.target.value,
    });
  };

  const handleOnSubmit = (evt) => {
    evt.preventDefault();
    setError();
    const url = new URL(inputs['engine-websocket-url']);
    if (inputs['web-integration-id']) url.searchParams.append('qlik-web-integration-id', inputs['web-integration-id']);
    if (inputs['client-id']) url.searchParams.append('qlik-client-id', inputs['client-id']);
    navigate(`/app-list?engine_url=${url.toString().replace('?', '&')}`);
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <Grid container spacing={2} direction="column" justifyContent="center">
        {fields.map((field, i) => (
          <Grid item xs={12} key={field}>
            <OutlinedInput
              fullWidth
              autoFocus={i === 0}
              disabled={isCredentialProvided && i === 1}
              name={field
                .split(' ')
                .map((x) => x.toLowerCase())
                .join('-')}
              error={info?.invalid}
              placeholder={i === 0 ? field : getFieldPlaceHolder({ field, isCredentialProvided })}
              onChange={(evt) => handleUpdateInputs(evt)}
            />
          </Grid>
        ))}

        <Grid container item xs={12} alignItems="center">
          <Grid item xs={10}>
            {error && <Error error={error} />}
          </Grid>
          <Grid container item xs={2} direction="row" alignItems="center" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={shouldDisableSubmitBtn({ isCredentialProvided, inputs, fields })}
            >
              Connect
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}
