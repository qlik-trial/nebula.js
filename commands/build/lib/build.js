const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

const fs = require('fs');
const extend = require('extend');
const yargs = require('yargs');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const postcss = require('rollup-plugin-postcss');
const replace = require('@rollup/plugin-replace');
const sourcemaps = require('rollup-plugin-sourcemaps');
const jsxPlugin = require('@babel/plugin-transform-react-jsx');
const json = require('@rollup/plugin-json');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const babelPreset = require('@babel/preset-env');

const { terser } = require('rollup-plugin-terser');
const resolveNative = require('./resolveNative');

const initConfig = require('./init-config');

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

const getOutputFileDefault = ({ pkg }) => pkg.main;

const getOutputNameDefault = ({ pkg }) => pkg.name.split('/').reverse()[0];

const config = ({
  mode = 'production',
  format = 'umd',
  cwd = process.cwd(),
  argv = { sourcemap: true },
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
  const { sourcemap, replacementStrings = {}, typescript } = argv;
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
      throw new Error(`Please install '@rollup/plugin-typescript' to build using typescript.`);
    }
  }

  const external = getExternal({ pkg, config: argv });
  // stardust should always be external
  if (external.indexOf('@nebula.js/stardust') === -1) {
    // eslint-disable-next-line no-console
    console.warn('@nebula.js/stardust should be specified as a peer dependency');
  }

  return {
    input: {
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
        }),
        commonjs({
          ignoreTryCatch: false, // Avoids problems with require() inside try catch (https://github.com/rollup/plugins/issues/1004)
        }),
        json(),
        babel({
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
        sourcemaps(),
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
    output: {
      banner,
      format,
      file: path.resolve(dir, outputFile),
      name: outputName,
      sourcemap,
      globals: {
        '@nebula.js/stardust': 'stardust',
      },
    },
  };
};

const umd = async (argv) => {
  const c = config({
    mode: argv.mode || 'production',
    format: 'umd',
    argv,
  });
  const bundle = await rollup.rollup(c.input);
  await bundle.write(c.output);
};

const esm = async (argv, core) => {
  const c = config({
    mode: argv.mode || 'production',
    format: 'esm',
    argv,
    core,
    behaviours: {
      getOutputFile: ({ pkg }) => pkg.module,
      enabled: ({ pkg }) => !!pkg.module,
    },
  });
  if (!c) {
    return undefined;
  }
  const bundle = await rollup.rollup(c.input);
  return bundle.write(c.output);
};

const systemjsBehaviours = {
  getExternal: ({ config: cfg }) => {
    const defaultExternal = ['@nebula.js/stardust', 'picasso.js', 'picasso-plugin-q', 'react', 'react-dom'];
    const { external } = cfg.systemjs || {};
    return Array.isArray(external) ? external : defaultExternal;
  },
  getOutputFile: ({ pkg }) => pkg.systemjs,
  getOutputName: () => undefined,
  enabled: ({ pkg }) => !!pkg.systemjs,
};

const systemjs = async (argv) => {
  const c = config({
    mode: argv.mode || 'production',
    format: 'systemjs',
    argv,
    behaviours: systemjsBehaviours,
  });
  if (!c) {
    return undefined;
  }
  const bundle = await rollup.rollup(c.input);
  return bundle.write(c.output);
};

function clearScreen(msg) {
  // source: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-shared-utils/lib/logger.js
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows);
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    if (msg) {
      console.log(msg);
    }
  }
}

const getPackage = (argv, cwd = process.cwd()) => require(path.resolve(argv.cwd || cwd, 'package.json')); // eslint-disable-line

const validateWatch = (argv) => {
  if (argv.watch === 'systemjs') {
    const pkg = getPackage(argv);
    if (!pkg.systemjs) {
      console.log(
        `${chalk.white.bgRed(' ERROR ')} ${chalk.red(
          'No "systemjs" field specifying output file found in package.json'
        )}`
      );
      return false;
    }
  }
  return true;
};

const getWatchOptions = (argv) => {
  const base = {
    mode: argv.mode || 'development',
    argv,
  };

  switch (argv.watch) {
    case 'systemjs':
      return { ...base, format: 'systemjs', behaviours: systemjsBehaviours };
    case 'umd':
    default:
      return { ...base, format: 'umd' };
  }
};

const watch = async (argv) => {
  if (!validateWatch(argv)) {
    return undefined;
  }
  const options = getWatchOptions(argv);
  const c = config(options);

  let hasWarnings = false;

  const watcher = rollup.watch({
    ...c.input,
    onwarn({ loc, message }) {
      if (!hasWarnings) {
        clearScreen();
      }
      console.log(
        `${chalk.black.bgYellow(' WARN  ')} ${chalk.yellow(
          loc ? `${loc.file} (${loc.line}:${loc.column}) ${message}` : message
        )}`
      );
      hasWarnings = true;
    },
    output: c.output,
  });

  return new Promise((resolve, reject) => {
    watcher.on('event', (event) => {
      switch (event.code) {
        case 'BUNDLE_START':
          hasWarnings = false;
          clearScreen();
          console.log(`${chalk.black.bgBlue(' INFO  ')}  Compiling...\n`);
          break;
        case 'FATAL':
        case 'ERROR':
          clearScreen();
          console.log(`${chalk.white.bgRed(' ERROR ')} ${chalk.red('Failed to compile\n\n')}`);
          console.error(event.error.stack);
          reject(watcher);
          break;
        case 'BUNDLE_END':
          if (!hasWarnings) {
            clearScreen();
          } else {
            console.log();
          }
          console.log(
            `${chalk.black.bgGreen(' DONE  ')} ${chalk.green(`Compiled successfully in ${event.duration}ms\n`)}`
          );
          resolve(watcher);
          break;
        default:
      }
    });
  });
};

async function build(argv = {}) {
  let defaultBuildConfig = {};

  // if not running via command line, run the config to inject default values
  if (!argv.$0) {
    const yargsArgs = argv.config ? ['--config', argv.config] : [];
    defaultBuildConfig = initConfig(yargs(yargsArgs)).argv;
  }

  const buildConfig = extend(true, {}, defaultBuildConfig, argv);
  if (buildConfig.watch) {
    return watch(buildConfig);
  }

  await umd(buildConfig);
  await esm(buildConfig);
  await systemjs(buildConfig);

  if (argv.core) {
    const core = path.resolve(process.cwd(), argv.core);
    await esm(buildConfig, core);
  }

  return undefined;
}

module.exports = build;
