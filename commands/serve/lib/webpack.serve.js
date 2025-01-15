/* eslint-disable global-require, no-console */
const path = require('path');
const fs = require('fs');
const homedir = require('os').homedir();
const chalk = require('chalk');
const express = require('express');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const snapshooterFn = require('./snapshot-server');
const snapshotRouter = require('./snapshot-router');

const { OAuthRouter, getAvailableAuthInstance } = require('./oauth-router');

const httpsKeyPath = path.join(homedir, '.certs/key.pem');
const httpsCertPath = path.join(homedir, '.certs/cert.pem');

module.exports = async ({
  host,
  port,
  disableHostCheck,
  enigmaConfig,
  clientId,
  webIntegrationId,
  snName,
  snUrl,
  dev = false,
  open = true,
  entryWatcher,
  watcher,
  serveConfig,
}) => {
  let config;
  let contentBase;
  const HTTPS = serveConfig.mfe;
  const url = `${HTTPS ? 'https' : 'http'}://${host}:${port}`;

  if (HTTPS) {
    if (!fs.existsSync(httpsKeyPath)) {
      throw new Error(`Failed to start using HTTPS. Missing key cert at path ${httpsKeyPath}`);
    }
    if (!fs.existsSync(httpsCertPath)) {
      throw new Error(`Failed to start using HTTPS. Missing cert at path ${httpsCertPath}`);
    }
  }

  const snapshotRoute = '/njs';

  const snapshooter = snapshooterFn({ snapshotUrl: `${url}/eRender.html` });

  (serveConfig.snapshots || []).forEach((s) => {
    snapshooter.storeSnapshot(s);
  });

  const authRouter = OAuthRouter({ originUrl: url });
  const snapRouter = snapshotRouter({
    base: `${url}${snapshotRoute}`,
    snapshotUrl: `${url}/eRender.html`,
    snapshooter,
  });

  const themes = serveConfig.themes || [];
  const renderConfigs = serveConfig.renderConfigs || [];

  if (dev) {
    const webpackConfig = require('./webpack.build');
    const srcDir = path.resolve(__dirname, '../web');
    const distDir = path.resolve(srcDir, '../dist');
    contentBase = distDir;
    config = webpackConfig({
      srcDir,
      distDir,
      dev: true,
      serveConfig,
    });
  } else {
    const webpackConfig = require('./webpack.prod');
    const srcDir = path.resolve(__dirname, '../dist');
    contentBase = srcDir;
    config = webpackConfig({
      srcDir,
      serveConfig,
    });
  }
  const options = {
    client: {
      logging: 'none',
      overlay: {
        warnings: false,
        errors: true,
      },
      progress: true,
    },
    hot: dev,
    host,
    port,
    allowedHosts: disableHostCheck ? 'all' : 'auto',
    open,
    historyApiFallback: true,
    // Disable nebula serve dev env when in MFE mode
    static: !serveConfig.mfe && {
      directory: contentBase,
      watch: {
        ignored: /node_modules/,
      },
    },
    setupMiddlewares(middlewares, devServer) {
      const { app } = devServer;

      app.use('/auth', authRouter);
      app.use(snapshotRoute, snapRouter);

      if (entryWatcher) {
        entryWatcher.addRoutes(app, devServer.options);
      }

      app.get('/themes', (req, res) => {
        const arr = themes.map((theme) => theme.id);
        res.json(arr);
      });

      app.get('/theme/:id', (req, res) => {
        const t = themes.filter((theme) => theme.id === req.params.id)[0];
        if (!t) {
          res.sendStatus('404');
        } else {
          res.json(t.theme);
        }
      });

      app.get('/render-configs', (_, res) => {
        res.json(renderConfigs);
      });

      app.get('/render-config/:id', (req, res) => {
        const renderConfig = renderConfigs.filter((r) => r.id === req.params.id)[0];
        if (!renderConfig) {
          res.sendStatus('404');
        } else {
          res.json(renderConfig.render);
        }
      });

      app.get('/info', (req, res) => {
        res.set(devServer.options.headers);
        res.json({
          enigma: enigmaConfig,
          clientId,
          webIntegrationId,
          isClientIdProvided: Boolean(clientId),
          isWebIntegrationIdProvided: Boolean(webIntegrationId),
          supernova: {
            name: snName,
            url: snUrl,
          },
          sock: {
            port: entryWatcher && entryWatcher.port,
          },
          flags: serveConfig.flags,
          anything: serveConfig.anything,
          themes: themes.map((theme) => theme.id),
          types: serveConfig.types,
          keyboardNavigation: serveConfig.keyboardNavigation,
        });
      });

      app.get('/apps', async (req, res) => {
        const appsListUrl = `/items?resourceType=app&limit=30&sort=-updatedAt`;
        const { data = [] } = await (await getAvailableAuthInstance().rest(appsListUrl)).json();
        res.status(200).json(
          data.map((d) => ({
            qDocId: d.resourceId,
            qTitle: d.name,
          }))
        );
      });

      if (serveConfig.resources) {
        app.use('/resources', express.static(serveConfig.resources));
      }

      app.use('/assets', express.static(path.resolve(__dirname, '../assets')));

      return middlewares;
    },
    proxy: [
      {
        context: '/render',
        target: `${url}/eRender.html`,
        ignorePath: true,
        logLevel: 'error',
      },
    ],
    server: HTTPS
      ? {
          type: 'https',
          options: {
            key: httpsKeyPath,
            cert: httpsCertPath,
          },
        }
      : {},
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'x-qlik-xrfkey,qlik-csrf-token',
    },
  };

  const compiler = webpack(config);
  const server = new WebpackDevServer(options, compiler);

  const close = () => {
    server.stop();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, close);
  });

  if (watcher) {
    let inError = false;
    watcher.on('event', (event) => {
      if (event.code === 'ERROR') {
        inError = true;
        server.sockWrite(server.sockets, 'errors', [event.error.stack]);
      } else if (event.code === 'BUNDLE_END' && inError) {
        inError = false;
        server.sockWrite(server.sockets, 'ok');
      }
    });
  }

  let initiated = false;

  return new Promise((resolve) => {
    // eslint-disable-line consistent-return
    compiler.hooks.done.tap('nebula serve', (stats) => {
      if (!initiated) {
        initiated = true;

        console.log(`     _  _________  __  ____   ___
    / |/ / __/ _ )/ / / / /  / _ |
   /    / _// _  / /_/ / /__/ __ |
  /_/|_/___/____/\\____/____/_/ |_|
    / __/ __/ _ \\ | / / __/
   _\\ \\/ _// , _/ |/ / _/
  /___/___/_/|_||___/___/
         `);

        if (serveConfig.mfe) {
          const bundleUrl = `${url}/pkg/${encodeURIComponent(snName)}`;
          console.log('Development server running in MFE mode');
          console.log(`Bundle served at ${chalk.green(bundleUrl)}`);
          console.log('');
          console.log('Use the bundle when overriding the import map');
        } else {
          console.log(`Development server running at ${chalk.green(url)}`);
        }

        resolve({
          context: '',
          url,
          close,
        });

        if (stats.hasErrors()) {
          stats.compilation.errors.forEach((e) => {
            console.log(chalk.red(e));
          });
          process.exit(1);
        }
      }
    });

    server.start();
  });
};
