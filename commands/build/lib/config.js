const fs = require('fs');
const path = require('path');
const babel = require('@rollup/plugin-babel');
const postcss = require('rollup-plugin-postcss');
const replace = require('@rollup/plugin-replace');
const sourcemaps = require('rollup-plugin-sourcemaps');
const json = require('@rollup/plugin-json');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const jsxPlugin = require('@babel/plugin-transform-react-jsx');
const babelPreset = require('@babel/preset-env');

const resolveNative = require('./resolveNative');

const resolveReplacementStrings = (replacementStrings) => {
  if (typeof replacementStrings !== 'object') {
    throw new Error('replacementStrings should be an object with key value pairs of strings!');
  }
  return replacementStrings;
};

const setupReactNative = (argv) => {
  const { reactNative } = argv;
  let reactNativePath;
  if (reactNative) {
    reactNativePath = argv.reactNativePath || './react-native';
    if (!fs.existsSync(`${reactNativePath}/package.json`)) {
      // eslint-disable-next-line no-console
      console.warn(
        `WARNING: No ${reactNativePath}/package.json was found.  If you really intended to build a react-native version of this package, please provide one.\nOther wise, to suppress this warning, omit the --reactNative flag.`
      );
      return false;
    }
  }
  return { reactNative, reactNativePath };
};

const getBanner = ({ pkg }) => {
  const { name, author, version, license } = pkg;
  const auth = typeof author === 'object' ? `${author.name} <${author.email}>` : author || '';

  return `/*
* ${name} v${version}
* Copyright (c) ${new Date().getFullYear()} ${auth}
* Released under the ${license} license.
*/
`;
};

const getExternalDefault = ({ pkg }) => {
  const peers = pkg.peerDependencies || {};
  return Object.keys(peers);
};

const getExternalCore = ({ pkg }) => {
  const defaultExternal = ['@nebula.js/stardust', /^@qlik\/api\//];
  const peers = Object.keys(pkg.peerDependencies || {});
  return [...defaultExternal, ...peers];
};

const getOutputFileDefault = ({ pkg }) => pkg.main;

const getOutputNameDefault = ({ pkg }) => pkg.name.split('/').reverse()[0];

const config = ({
  mode = 'production',
  format = 'umd',
  cwd = process.cwd(),
  argv = { sourcemap: true, codeSplit: false },
  core,
  behaviours: {
    getExternal = getExternalDefault,
    getOutputFile = getOutputFileDefault,
    getOutputName = getOutputNameDefault,
    // Return false if no build should be done, otherwise true
    enabled = () => true,
  } = {},
} = {}) => {
  const CWD = argv.cwd || cwd;
  const { reactNative, reactNativePath } = setupReactNative(argv);
  let dir = CWD;
  let pkg = require(path.resolve(CWD, 'package.json')); // eslint-disable-line
  const corePkg = core ? require(path.resolve(core, 'package.json')) : null; // eslint-disable-line
  pkg = reactNative ? require(path.resolve(reactNativePath, 'package.json')) : pkg; // eslint-disable-line
  const { sourcemap, replacementStrings = {}, typescript, preferBuiltins, browser } = argv;
  const banner = getBanner({ pkg });
  const outputName = getOutputName({ pkg, config: argv });

  if (reactNative) {
    dir = `${dir}/${reactNativePath}`;
  } else if (corePkg) {
    pkg = corePkg;
    dir = core;
  }

  if (!enabled({ pkg })) {
    return false;
  }
  const outputFile = getOutputFile({ pkg, config: argv });

  const extensions = ['.mjs', '.js', '.jsx', '.json', '.node'];

  let typescriptPlugin;
  if (typescript) {
    extensions.push('.tsx', '.ts');
    try {
      typescriptPlugin = require('@rollup/plugin-typescript'); // eslint-disable-line
    } catch (e) {
      throw new Error(`${e}\n '@rollup/plugin-typescript' is required to build using typescript.`);
    }
  }

  const external = core ? getExternalCore({ pkg }) : getExternal({ pkg, config: argv });
  // stardust should always be external
  if (external.indexOf('@nebula.js/stardust') === -1) {
    // eslint-disable-next-line no-console
    console.warn('@nebula.js/stardust should be specified as a peer dependency');
    external.push('@nebula.js/stardust');
  }

  const output = () => {
    const outputConfig = {
      banner,
      format,
      name: outputName,
      sourcemap,
      globals: {
        '@nebula.js/stardust': 'stardust',
      },
    };
    if (!argv.codeSplit || format === 'umd') {
      outputConfig.file = path.resolve(dir, outputFile);
    } else {
      outputConfig.dir = path.resolve(dir, outputFile.split('/')[0]);
    }
    if (format === 'umd') {
      outputConfig.inlineDynamicImports = true;
    }
    return outputConfig;
  };

  return {
    input: {
      onwarn(warning, warn) {
        // Supress "use client" warnings coming from MUI bundling
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes(`"use client"`)) {
          return;
        }
        warn(warning);
      },
      input: path.resolve(CWD, 'src/index'),
      external,
      plugins: [
        resolveNative({ reactNative }),
        replace({
          'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
          preventAssignment: true,
          ...resolveReplacementStrings(replacementStrings),
        }),
        nodeResolve({
          extensions,
          browser,
          preferBuiltins,
        }),
        commonjs({
          ignoreTryCatch: false, // Avoids problems with require() inside try catch (https://github.com/rollup/plugins/issues/1004)
        }),
        json(),
        babel({
          babelHelpers: 'bundled',
          babelrc: false,
          inputSourceMap: false, // without this you get wrong source maps, but I don't know why
          extensions,
          presets: [
            [
              babelPreset,
              {
                modules: false,
                targets: {
                  browsers: ['chrome 62'],
                },
              },
            ],
          ],
          plugins: [[jsxPlugin]],
        }),
        ...[sourcemap ? sourcemaps() : undefined],
        postcss({}),
        ...[typescript ? typescriptPlugin() : false],
        ...[
          mode === 'production'
            ? terser({
                output: {
                  preamble: banner,
                },
              })
            : false,
        ],
      ].filter(Boolean),
    },
    output: output(),
  };
};

module.exports = config;
