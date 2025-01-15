const systemjsBehaviours = {
  getExternal: ({ config: cfg }) => {
    const defaultExternal = [
      '@nebula.js/stardust',
      'picasso.js',
      'picasso-plugin-q',
      'react',
      'react-dom',
      /^(?!@qlik-trial\/qmfe-data-client-parcels)(@qlik-trial\/qmfe-)/,
      /^@qlik\/api\//,
    ];
    const { external } = cfg.systemjs || {};
    return Array.isArray(external) ? external : defaultExternal;
  },
  getOutputFile: ({ pkg }) => pkg.systemjs,
  getOutputName: () => undefined,
  enabled: ({ pkg }) => !!pkg.systemjs,
};

module.exports = systemjsBehaviours;
