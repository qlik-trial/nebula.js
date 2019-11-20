const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const babelPath = require.resolve('babel-loader');
const babelPresetEnvPath = require.resolve('@babel/preset-env');
const babelPresetReactPath = require.resolve('@babel/preset-react');
const babelOptionalPath = require.resolve('@babel/plugin-proposal-optional-chaining');
const babelNullishPath = require.resolve('@babel/plugin-proposal-nullish-coalescing-operator');

const sourceMapLoaderPath = require.resolve('source-map-loader');
const favicon = path.resolve(__dirname, '../../../docs/assets/njs.png');

const cfg = ({ srcDir, distDir, dev = false }) => {
  const config = {
    mode: dev ? 'development' : 'production',
    entry: {
      eRender: [path.resolve(srcDir, 'eRender')],
      eDev: [path.resolve(srcDir, 'eDev')],
      eHub: [path.resolve(srcDir, 'eHub')],
    },
    devtool: 'source-map',
    output: {
      path: distDir,
      filename: '[name].js',
    },
    resolve: {
      alias: {
        ...(dev
          ? {
              // For local nebula.js development use aliasing to be able to debug nucleus / supernova
              '@nebula.js/nucleus/src/hooks': path.resolve(process.cwd(), 'apis/nucleus/src/hooks'),
              '@nebula.js/nucleus/src/object': path.resolve(process.cwd(), 'apis/nucleus/src/object'),
              '@nebula.js/nucleus': path.resolve(process.cwd(), 'apis/nucleus/src'),
              '@nebula.js/supernova': path.resolve(process.cwd(), 'apis/supernova/src'),
              '@nebula.js/theme': path.resolve(process.cwd(), 'apis/theme/src'),
            }
          : {}),
      },
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js?$/,
          loader: sourceMapLoaderPath,
        },
        {
          test: /\.jsx?$/,
          sideEffects: false,
          include: [srcDir, /nucleus/, /supernova/, /theme/, /ui\/icons/],
          use: {
            loader: babelPath,
            options: {
              presets: [
                [
                  babelPresetEnvPath,
                  {
                    modules: false,
                    targets: {
                      browsers: ['last 2 chrome versions'],
                    },
                  },
                ],
                babelPresetReactPath,
              ],
              plugins: [babelOptionalPath, babelNullishPath],
            },
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eRender.html'),
        filename: 'eRender.html',
        chunks: ['eRender'],
        favicon,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eDev.html'),
        filename: 'eDev.html',
        chunks: ['eDev'],
        favicon,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eHub.html'),
        filename: 'eHub.html',
        chunks: ['eHub'],
        favicon,
      }),
    ],
  };

  return config;
};

if (!process.env.DEFAULTS) {
  module.exports = cfg;
} else {
  module.exports = cfg({
    srcDir: path.resolve(__dirname, '../web'),
    distDir: path.resolve(__dirname, '../dist'),
    dev: false,
  });
}
