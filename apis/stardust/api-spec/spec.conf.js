module.exports = {
  fromJsdoc: {
    glob: [
      '!*.spec.js',
      '../nucleus/src/**/*.js',
      '../nucleus/src/**/*.jsx',
      '../supernova/src/**/*.js',
      '../locale/src/translator.js',
      '../theme/src/**/*.js',
      '../conversion/src/**/*.js',
      '../enigma-mocker/src/**/*.js',
      '!../nucleus/src/components/listbox/default-properties.js',
    ],
    api: {
      stability: 'stable',
    },
    output: {
      sort: {
        alpha: false,
      },
      file: './api-spec/spec.json',
    },
    parse: {
      types: {
        undefined: {},
        'qix.NxAppLayout': {},
        'qix.GenericObject': {},
        'qix.Global': {},
        'qix.Doc': {
          url: 'https://qlik.dev/apis/json-rpc/qix/doc#%23%2Fentries%2FDoc',
        },
        'qix.GenericObjectLayout': {
          url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FGenericObjectLayout',
        },
        'qix.GenericObjectProperties': {
          url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FGenericObjectProperties',
        },
        'qix.NxDimension': {
          url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FNxDimension',
        },
        'qix.NxMeasure': {
          url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FNxMeasure',
        },
      },
    },
  },
  toDts: {
    spec: './api-spec/spec.json',
    output: {
      file: './types/index.d.ts',
    },
    dependencies: {
      imports: [{ type: '* as qix', package: "'@qlik/api/qix'" }],
    },
  },
};
