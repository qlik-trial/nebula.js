/* eslint-disable */
import { auth, qix } from '@qlik/api';
import { embed } from '@nebula.js/stardust';
import barchart from '@nebula.js/sn-bar-chart';

async function run() {
  const appId = '<App id>';
  // https://github.com/qlik-oss/qlik-api-ts/blob/main/docs/authentication.md
  const hostConfig = {
    authType: '<AuthenticationType: ex "oauth2" or "cookie"',
    host: '<URL>',
    // connection config based on authType
    webIntegrationId: '<Qlik web integration id>', // cookie
    clientId: '<Qlik OAuth client id>', // oauth2
    accessTokenStorage: 'session', // for oauth2
  };

  auth.setDefaultHostConfig(hostConfig);
  const appSession = qix.openAppSession(appId);
  const app = await appSession.getDoc();

  const nebula = embed(app, {
    context: {
      theme: 'light',
      language: 'en-US',
    },
    types: [
      {
        name: 'barchart',
        load: () => Promise.resolve(barchart),
      },
    ],
  });

  (await nebula.selections()).mount(document.querySelector('.toolbar'));

  // nebula.render({ element: document.querySelector('.object'), id: "" });
}

run();
