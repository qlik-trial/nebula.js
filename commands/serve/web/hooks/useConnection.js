import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { connect } from '../connect';

export const useConnection = ({ info, cachedConnectionsData }) => {
  const location = useLocation();
  const [glob, setGlobal] = useState();
  const [treatAsDesktop, setTreatAsDesktop] = useState(false);
  const [error, setError] = useState();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (location.pathname === '/' || !info || !info.engineUrl) return;

    if (info.invalid) {
      setError({
        message: 'Connection failed',
        hints: ['The WebSocket URL is not valid.'],
      });
      return;
    }

    connect()
      .then((result) => handleConnectionSuccess({ result, setGlobal, setError, setTreatAsDesktop }))
      .then(() => cachedConnectionsData.addCachedConnections({ info }))
      .catch((err) => handleConnectionFailure({ error: err, info, setError }));
  }, [info, location.pathname]);

  return { glob, setGlobal, treatAsDesktop, setTreatAsDesktop, error, setError, activeStep, setActiveStep };
};

export const handleConnectionSuccess = async ({ result, setGlobal, setTreatAsDesktop, setError }) => {
  handleSessionNotification({ result, setError, setGlobal });
  setGlobal(result);
  if (!result.getDocList) return;
  try {
    const config = await result.getConfiguration();
    if (config && config.qFeatures && config.qFeatures.qIsDesktop) setTreatAsDesktop(true);
  } catch (error) {
    throw new Error('Failed to get configuration');
  }
};

export const handleConnectionFailure = ({ error, info, setError }) => {
  const oops = {
    message: 'Something went wrong, check the devtools console',
    hints: [],
  };
  if (error.target instanceof WebSocket) {
    oops.message = `Connection failed to ${info.engineUrl}`;
    if (/\.qlik[A-Za-z0-9-]+\.com/.test(info.engineUrl) && !info.webIntegrationId) {
      oops.hints.push(
        'If you are connecting to Qlik Cloud Services, make sure to provide a web integration id or client id.'
      );
    }
    setError(oops);
    return;
  }
  setError(oops);
  console.error(error);
};

export const handleSessionNotification = ({ result, setError, setGlobal }) => {
  if (result.session) {
    result.session.on('notification:OnAuthenticationInformation', (e) => {
      if (e.mustAuthenticate) {
        setError({
          message: 'Could not authenticate.',
          hints: [
            `In your virtual proxy advanced settings in the QMC, make sure to whitelist ${window.location.host}, ensure "Has secure attribute" is enabled and that "SameSite attribute" is set to "None".`,
          ],
        });
        setGlobal(null);
      }
    });
  }
};
