/* eslint-disable no-console */
const path = require('path');
const crypto = require('crypto');
const babel = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const terser = require('@rollup/plugin-terser');

const localeStringValidator = require('./tools/locale-string-validator.cjs');

const cwd = process.cwd();
const pkg = require(path.join(cwd, 'package.json')); // eslint-disable-line
const { name, version, license } = pkg;

let corePkg;
try {
  corePkg = require(path.join(cwd, 'core', 'package.json')); // eslint-disable-line
} catch (e) {
  // do nothing
}

const versionHash = crypto.createHash('md5').update(version).digest('hex').slice(0, 4);

const targetName = name.split('/')[1];
const targetDirName = 'dist';
const targetDir = path.join(cwd, targetDirName);

const getFileName = (format, dev) => `${targetName}${format ? `.${format}` : ''}${dev ? '.dev' : ''}.js`;
const getTargetFileName = (format, dev) => `${targetDirName}/${getFileName(format, dev)}`;

// verify package targets and names
if (pkg.main !== 'index.js') {
  throw Error(`main target must be index.js`);
}

// in our webpack/rollup configs we include '.dev.js' as file extension when building
// a dev distribution, the module target should therefore end with '.esm' and not with '.esm.js'
// so that the node resolve algorithm finds the correct module based on module format and dev mode
// e.g. '@nebula.js/stardust' -> '@nebula.js/stardust/dist/stardust.esm.dev.js'
const moduleTargetName = getTargetFileName('esm').replace(/\.js$/, '');
if (pkg.module && pkg.module !== moduleTargetName) {
  throw Error(`module target must be ${moduleTargetName}`);
}
if (pkg.unpkg && pkg.unpkg !== getTargetFileName('')) {
  throw Error(`unpkg target must be ${getTargetFileName('')}`);
}
if (pkg.jsdelivr && pkg.jsdelivr !== getTargetFileName('')) {
  throw Error(`jsdelivr target must be ${getTargetFileName('')}`);
}

const banner = `/*
* ${name} v${version}
* Copyright (c) ${new Date().getFullYear()} QlikTech International AB
* Released under the ${license} license.
*/
`;

const browserList = [
  'last 2 Chrome versions',
  'last 2 Firefox versions',
  'last 2 Edge versions',
  'Safari >= 11.0',
  'iOS >= 12.2',
];

const GLOBALS = {
  react: 'React',
  'react-dom': 'ReactDOM',
  '@nebula.js/stardust': 'stardust',
};

const watch = process.argv.indexOf('-w') > 2;

const TYPES_SCOPE_RX = /^@qlik\/api/;

const config = ({ format = 'umd', debug = false, file, targetPkg }) => {
  const umdName = targetName
    .replace(/-([a-z])/g, (m, p1) => p1.toUpperCase())
    .split('.js')
    .join('');

  if (Object.keys(targetPkg.dependencies || {}).filter((dep) => !TYPES_SCOPE_RX.test(dep)).length) {
    console.log(targetPkg.name);
    console.log(JSON.stringify(Object.keys(targetPkg.dependencies || {}).filter((dep) => !TYPES_SCOPE_RX.test(dep))));
    throw new Error('Dependencies for a web javascript library makes no sense');
  }

  const peers = Object.keys(targetPkg.peerDependencies || {});

  // all peers should be externals for esm bundle
  // const esmExternals = peers;

  // peers that are not devDeps should be externals for full bundle
  // const bundleExternals = peers.filter((p) => typeof (pkg.devDependencies || {})[p] === 'undefined');

  const external = peers;
  const globals = {};
  external.forEach((e) => {
    if ([GLOBALS[e]]) {
      globals[e] = GLOBALS[e];
    } else {
      console.warn(`External '${e}' has no global value`);
    }
  });

  const cfg = {
    onwarn(warning, warn) {
      // Supress "use client" warnings coming from MUI bundling
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes(`"use client"`)) {
        return;
      }
      if (warning.code === 'INVALID_ANNOTATION' && warning.frame.includes(`// eslint-disable-next-line react`)) {
        return;
      }
      if (warning.code === 'INVALID_ANNOTATION' && warning.message.includes(`@mui/material`)) {
        return;
      }
      if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes(`node_modules/semver`)) {
        return;
      }
      warn(warning);
    },
    input: path.resolve(cwd, 'src', 'index'),
    output: {
      // file: path.resolve(targetDir, getFileName(isEsm ? 'esm' : '', dev)),
      file,
      format,
      exports: ['test-utils', 'stardust'].indexOf(targetName) !== -1 ? 'named' : 'default',
      name: umdName,
      sourcemap: true,
      banner,
      globals,
    },
    external,
    plugins: [
      replace({
        __NEBULA_DEV__: debug,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV === 'development' ? 'development' : 'production'),
        'process.env.NEBULA_VERSION': JSON.stringify(version),
        'process.env.NEBULA_VERSION_HASH': JSON.stringify(versionHash),
        preventAssignment: true,
      }),
      nodeResolve({
        extensions: [debug ? '.dev.js' : false, '.js', '.jsx'].filter(Boolean),
      }),
      json(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        include: [
          /\/apis\/conversion\//,
          /\/apis\/enigma-mocker\//,
          /\/apis\/locale\//,
          /\/apis\/nucleus\//,
          /\/apis\/snapshooter\//,
          /\/apis\/stardust\//,
          /\/apis\/supernova\//,
          /\/apis\/theme\//,
          /\/packages\/ui\//,
        ],
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                browsers: [...browserList, 'chrome 62'],
              },
            },
          ],
        ],
        plugins: [['@babel/plugin-transform-react-jsx'], [localeStringValidator, {}]],
      }),
    ],
  };

  if (!debug) {
    cfg.plugins.push(
      terser({
        output: {
          preamble: banner,
        },
      })
    );
  }

  return cfg;
};

let dist = [
  // production
  watch
    ? false
    : config({
        targetPkg: pkg,
        file: path.resolve(targetDir, getFileName()),
      }),
  // dev
  watch
    ? false
    : config({
        debug: true,
        targetPkg: pkg,
        file: path.resolve(targetDir, getFileName('', true)),
      }),
  // esm
  pkg.module
    ? config({
        format: 'esm',
        targetPkg: pkg,
        file: path.resolve(targetDir, getFileName('esm', false)),
      })
    : false,

  // esm dev
  pkg.module
    ? config({
        debug: true,
        format: 'esm',
        targetPkg: pkg,
        file: path.resolve(targetDir, getFileName('esm', true)),
      })
    : false,

  // core esm
  corePkg && corePkg.module
    ? config({
        format: 'esm',
        targetPkg: corePkg,
        file: path.resolve(cwd, 'core', corePkg.module),
      })
    : false,
  // core esm dev
  corePkg && corePkg.module
    ? config({
        debug: true,
        format: 'esm',
        targetPkg: corePkg,
        file: path.resolve(cwd, 'core', 'esm', 'dev.js'),
      })
    : false,
];

if (targetName === 'test-utils') {
  dist = [
    config({
      targetPkg: pkg,
      file: path.resolve(targetDir, getFileName()),
    }),
  ];
}

module.exports = dist.filter(Boolean);
