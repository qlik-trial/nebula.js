import { embed } from '@nebula.js/stardust';
import EnigmaMocker from '@nebula.js/enigma-mocker';
import extend from 'extend';
import { getConnectionInfo } from './connect';
import { getModule } from './hot';

const getDefaultGenericObject = ({ type }) => ({
  getLayout: {
    qInfo: { qId: +Date.now() },
    visualization: type,
  },
});

const getServeOptions = ({ themes = [], supernova = {}, flags, anything }) => {
  const options = {
    instanceConfig: {
      themes: themes.map((t) => ({
        id: t,
        load: async () => (await fetch(`/theme/${t}`)).json(),
      })),
      context: {
        constraints: {},
      },
      flags,
      anything,
    },
  };
  if (supernova.name) {
    options.type = supernova.name;
  }
  if (supernova.name || supernova.url) {
    options.load = async () => getModule(supernova.name, supernova.url);
  }

  return options;
};

const getUrlParamOptions = (params) => ({
  instanceConfig: {
    context: {
      theme: params.theme,
      language: params.language,
      keyboardNavigation: params.keyboardNavigation,
    },
  },
});

function validateOptions(options) {
  if (!options.type) {
    throw new Error(
      'No visualization type. Specify it either in fixture in the property "type" or as "--type" to Nebula serve.'
    );
  }
  if (!options.load) {
    throw new Error('Unable to load the visualization. Specify it in option "--entry" to Nebula serve.');
  }
}

async function getOptions({ params, fixture, serverInfo }) {
  const options = extend(true, {}, getServeOptions(serverInfo), fixture, getUrlParamOptions(params));
  options.genericObjects = options.genericObjects || [getDefaultGenericObject({ type: options.type })];

  validateOptions(options);

  return options;
}

function validateFixture({ genericObjects } = {}) {
  if (!genericObjects || genericObjects.length === 0) {
    return;
  }
  if (!genericObjects[0] || !genericObjects[0].getLayout) {
    throw new Error('Invalid getLayout of generic object');
  }
  const { getLayout } = genericObjects[0];
  const layout = typeof getLayout === 'function' ? getLayout() : getLayout;
  if (!layout.visualization) {
    throw new Error('No "visualization" specified on generic object on path "getLayout"');
  }
  if (!layout.qInfo || !layout.qInfo.qId) {
    throw new Error('No "qId" specified on generic object on path "getLayout.qInfo');
  }
}

async function getFixture(fixturePath) {
  const fixtureFn = window.serveFixtures.get(fixturePath);
  if (!fixtureFn) {
    throw new Error(`Unable to load fixture ${fixturePath}`);
  }

  const fixture = fixtureFn();
  validateFixture(fixture);

  return fixture;
}

function getQId(genericObjects = []) {
  const { getLayout } = genericObjects[0];
  const layout = typeof getLayout === 'function' ? getLayout() : getLayout;

  return layout.qInfo.qId;
}

const renderFixture = async (params) => {
  const element = document.querySelector('#chart-container');
  const serverInfo = await getConnectionInfo();
  const fixture = await getFixture(params.fixture);
  const { type, load, genericObjects, instanceConfig, snConfig, enigmaMockerOptions } = await getOptions({
    fixture,
    params,
    serverInfo,
  });
  const mockedApp = await EnigmaMocker.fromGenericObjects(genericObjects, enigmaMockerOptions);
  const qId = getQId(genericObjects);
  const servedTypes = (serverInfo && serverInfo.types) || [];
  const nebbie = embed(mockedApp, {
    types: [
      {
        name: type,
        load,
      },
      ...servedTypes.map((configType) => ({
        name: configType.name,
        load: async () => getModule(configType.name, configType.url),
      })),
    ],
    ...instanceConfig,
  });
  const viz = await nebbie.render({
    type,
    element,
    id: qId,
    ...snConfig,
  });
  const events = snConfig?.events || [];
  events.forEach((e) => {
    viz.addListener(e, (message) => {
      document.querySelector('#events').innerHTML = message;
    });
  });
};

export default renderFixture;
