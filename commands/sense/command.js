const buildLegacy = require('./lib/build-legacy');
const build = require('./lib/build');

module.exports = {
  command: 'sense',
  desc: 'Build a nebula visualization as a Qlik Sense extension',
  builder(yargs) {
    yargs.option('ext', {
      type: 'string',
      required: false,
      desc: 'Extension definition',
    });
    yargs.option('meta', {
      type: 'string',
      required: false,
      desc: 'Extension meta information',
    });
    yargs.option('output', {
      type: 'string',
      required: false,
      default: '<name>-ext',
      desc: 'Destination directory',
    });
    yargs.option('minify', {
      type: 'boolean',
      required: false,
      default: true,
      desc: 'Minify and uglify code',
    });
    yargs.option('sourcemap', {
      type: 'boolean',
      required: false,
      default: false,
      desc: 'Generate sourcemaps',
    });
    yargs.option('legacy', {
      type: 'boolean',
      required: false,
      default: false,
      desc: 'Generate legacy extension',
    });
  },
  handler(argv) {
    if (argv.legacy) {
      buildLegacy(argv);
    } else {
      build(argv);
    }
  },
};
