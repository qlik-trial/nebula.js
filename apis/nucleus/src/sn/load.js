import RenderError from '../utils/render-error';

const LOADED = {};

/**
 * @interface LoadType
 * @param {object} type
 * @param {string} type.name
 * @param {string} type.version
 * @returns {Promise<Visualization>}
 */

export async function load(name, version, { config }, loader) {
  const key = `${name}__${version}`;
  if (!LOADED[key]) {
    const sKey = `${name}${(version && ` v${version}`) || ''}`;
    if (loader && typeof loader !== 'function') {
      throw new Error(`load of visualization '${sKey}' is not a fuction, wrap load promise in function`);
    }
    const p = (loader || config.load)({
      name,
      version,
    });
    const prom = Promise.resolve(p);
    LOADED[key] = prom
      .then((sn) => {
        if (!sn) {
          // TODO - improve validation
          throw new Error(`load() of visualization '${sKey}' resolved to an invalid object`);
        }
        return sn;
      })
      .catch((e) => {
        if (__NEBULA_DEV__) {
          console.warn(e); // eslint-disable-line no-console
        }
        throw new RenderError(`Failed to load visualization: '${sKey}'`, e);
      });
  }

  return LOADED[key];
}

export function clearFromCache(name) {
  Object.keys(LOADED).forEach((key) => {
    if (key.split('__')[0] === name) {
      LOADED[key] = undefined;
    }
  });
}
