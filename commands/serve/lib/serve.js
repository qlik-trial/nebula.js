const path = require('path');
const fs = require('fs');
const portfinder = require('portfinder');
const extend = require('extend');
const yargs = require('yargs');
const WebSocket = require('ws').Server;
const chokidar = require('chokidar');
const build = require('@nebula.js/cli-build');

const initConfig = require('./init-config');

const webpackServe = require('./webpack.serve');

const initiateWatch = async ({ snPath = '', snName, host }) => {
  // TODO - timeout
  let onInitiated;
  const done = new Promise((resolve) => {
    onInitiated = resolve;
  });

  const wsPort = await portfinder.getPortPromise({ port: 5001, host });

  const ws = new WebSocket({
    port: wsPort,
    clientTracking: true,
  });

  const choker = chokidar.watch(snPath, {
    ignoreInitial: false,
    disableGlobbing: true,
  });

  choker.on('add', () => {
    onInitiated();
  });

  choker.on('change', () => {
    [...ws.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          changed: [snName],
        })
      );
    });
  });

  const cache = {};

  return {
    addRoutes(app, options) {
      app.get('/pkg/:name', async (req, res) => {
        const { name } = req.params;
        await done;

        let file;
        if (cache[name]) {
          file = cache[name];
        } else if (name === snName) {
          file = snPath;
        } else if (/\.map$/.test(name)) {
          const sources = Object.keys(cache);
          for (let i = 0; i < sources.length; i++) {
            const p = cache[sources[i]];
            const filename = path.basename(p);
            if (`${filename}.map` === name) {
              file = path.resolve(path.dirname(p), name);
              break;
            }
          }
        } else {
          file = require.resolve(name, {
            paths: [process.cwd()],
          });
        }

        cache[name] = file;

        if (fs.existsSync(file)) {
          const f = fs.readFileSync(file);
          res.set(options.headers);
          res.send(f);
        } else {
          res.sendStatus('404');
        }
      });
    },
    async close() {
      await ws.close();
      await choker.close();
    },
    port: wsPort,
  };
};

module.exports = async (argv) => {
  let context = process.cwd();
  let defaultServeConfig = {};
  let runFromDirectory = false;

  if (!argv.$0) {
    const yargsArgs = argv.config ? ['--config', argv.config] : [];
    defaultServeConfig = initConfig(yargs(yargsArgs)).argv;
  }

  const serveConfig = extend(true, {}, defaultServeConfig, argv);
  const host = serveConfig.host || 'localhost';
  const port = serveConfig.port || (await portfinder.getPortPromise({ host }));
  const enigmaConfig = serveConfig.enigma;

  let snPath;
  let snName;
  let watcher;
  let snUrl;
  if (/^https?/.test(serveConfig.entry)) {
    snName = 'remote';
    snUrl = serveConfig.entry;
  } else if (serveConfig.entry) {
    snPath = path.resolve(context, serveConfig.entry);
    const stat = fs.statSync(snPath);
    if (stat.isDirectory()) {
      runFromDirectory = true;
      context = snPath;
    } else {
      const parsed = path.parse(snPath);
      snName = parsed.name;
    }
  } else {
    runFromDirectory = true;
  }

  if (runFromDirectory) {
    if (serveConfig.build !== false) {
      watcher = await build({
        watch: serveConfig.mfe ? 'systemjs' : 'umd',
        config: serveConfig.config,
        cwd: context,
      });
    }
    try {
      const externalPkg = require(path.resolve(context, 'package.json')); // eslint-disable-line global-require
      const externalEntry = serveConfig.mfe ? externalPkg.systemjs : externalPkg.main;
      snName = externalPkg.name;
      snPath = path.resolve(context, externalEntry);
    } catch (e) {
      //
    }
  }

  const ww = snUrl ? null : await initiateWatch({ snPath, snName: serveConfig.type || snName, host });

  const server = await webpackServe({
    host,
    port,
    disableHostCheck: serveConfig.disableHostCheck,
    enigmaConfig,
    clientId: serveConfig.clientId,
    webIntegrationId: serveConfig.webIntegrationId,
    snName: serveConfig.type || snName,
    snUrl,
    dev: process.env.MONO === 'true',
    open: serveConfig.open !== false && !serveConfig.mfe,
    entryWatcher: ww,
    watcher,
    serveConfig,
  });

  const close = async () => {
    if (watcher) {
      watcher.close();
    }
    if (ww) {
      await ww.close();
    }
    server.close();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, close);
  });

  // eslint-disable-next-line consistent-return
  return {
    url: server.url,
    close,
  };
};
