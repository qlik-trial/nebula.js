import React from 'react';
import { Typography } from '@mui/material';
import { ThemeWrapper } from '../../ThemeWrapper';
import { ContentWrapper } from '../styles';

/**
 *
 * Since we updated our OAuth redirect link to include `/auth/` part in it,
 * we are currently showing this error page for old client-ids that
 * are still trying to redirect to the /login/callback url
 * the point is to give them a quick guid about update their
 * redirect url in tenant
 */
const OAuthRedirectLinkError = () => (
  <ThemeWrapper>
    <ContentWrapper marginTop={5}>
      <Typography variant="h4" gutterBottom>
        Error!
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        OAUTH REDIRECT LINK ERROR!
      </Typography>

      <Typography variant="body2" paragraph>
        We updated our route which was previously had the responsibility to handle the redirected link including the
        correct credentials to have{' '}
        <code>
          <b>/auth/</b>
        </code>{' '}
        part within it. This change is now impacting your redirect links if you already using your old client-id.
      </Typography>

      <Typography variant="h6" gutterBottom>
        Here is what you need to do:
      </Typography>

      <Typography variant="body2" paragraph>
        <b>1.</b> Go to your tenant that you created your client id
        <br />
        <br />
        <b>2.</b> Open Managment console
        <br />
        <br />
        <b>3.</b> Click on OAuth menu in left panel (if you dont see that menu it means you dont have access to it and
        you need to ask a person who has the proper access)
        <br />
        <br />
        <b>4.</b> Find your Client id and from ... menu, click on edit
        <br />
        <br />
        <b>5.</b> There is a section called &quot;Add redirect URLs&quot;, find it and add your new link. The only
        difference is that your new link will include `/auth/` part in it, for example, if you had this redirect link
        previously:
        <code>http://localhost:8000/login/callback</code>
        <br />
        now it will be like:
        <code>
          http://localhost:8000/<b>auth/</b>login/callback
        </code>
        <br />
        <br />
        <b>6.</b> Click on save and you are set!
        <br />
      </Typography>
    </ContentWrapper>
  </ThemeWrapper>
);

export default OAuthRedirectLinkError;
