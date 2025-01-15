/* eslint global-require: 0, no-param-reassign: 0 */
const fs = require('fs');

const defaultFilename = 'nebula.config.js';
const RX = new RegExp(`${defaultFilename.replace(/\./g, '\\.')}$`);

const options = {
  config: {
    type: 'string',
    description: 'Path to a JavaScript config file',
    default: defaultFilename,
    alias: 'c',
  },
  watch: {
    description: 'Rebuild the bundle when its source files change on disk',
    alias: 'w',
    choices: ['umd', 'systemjs', true],
  },
  sourcemap: {
    description: 'Generate source maps',
    type: 'boolean',
    alias: 'm',
    default: true,
  },
  mode: {
    description: 'Explicitly set mode ("development"|"production")',
    type: 'string',
    default: undefined,
  },
  systemjs: {
    description: 'Enable to transpile a systemjs format for release',
    type: 'boolean',
    default: true,
  },
  core: {
    description: 'Set a core build target to compile an ES Module for release',
    type: 'string',
    default: undefined,
  },
  typescript: {
    description: 'Enable typescript parsing',
    type: 'boolean',
    default: false,
  },
  preferBuiltins: {
    description:
      'In Rollup, preferBuiltins is a configuration option that specifies whether to use Node.js built-in modules (such as fs or path) when bundling for Node.js environment.',
    type: 'boolean',
    default: true,
  },
  browser: {
    description:
      'In Rollup, the browser option is a configuration option that specifies whether the bundle is intended to run in a browser environment.',
    type: 'boolean',
    default: true,
  },
  codeSplit: {
    description:
      'Sets output.dir instead of output.file for code-splitting builds. Sets inlineDynamicImports for umd builds to avoid throwing errors.',
    type: 'boolean',
    default: false,
  },
};

// nebula build --watch                - watch umd bundle
// nebula build --watch umd            - watch umd bundle
// nebula build --watch systemjs       - watch systemjs bundle
// nebula build                        - watch disabled
const watchMiddleware = (argv) => {
  let value = false;

  if (argv.watch === true) {
    value = 'umd';
  } else if (typeof argv.watch === 'string') {
    value = argv.watch;
  }

  argv.watch = value;
  argv.w = value;

  return argv;
};

module.exports = (yargs) => {
  yargs.parserConfiguration({
    'dot-notation': false, // To avoid parsing "replacementStrings" with dot-notation into objects
  });

  return yargs
    .options(options)
    .config('config', (configPath) => {
      if (configPath === null) {
        return {};
      }
      if (!fs.existsSync(configPath)) {
        if (RX.test(configPath)) {
          // do nothing if default filename doesn't exist
          return {};
        }
        throw new Error(`Config ${configPath} not found`);
      }
      return require(configPath).build || {};
    })
    .middleware(watchMiddleware);
};
