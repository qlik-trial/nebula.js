import populateData from './populator';
import init from './initiate';

/**
 * @typedef {string | qix.NxDimension | qix.NxMeasure | LibraryField} Field
 */

/**
 * @interface RenderConfig
 * @description Configuration for rendering a visualisation, either creating or fetching an existing object.
 * @property {HTMLElement} element Target html element to render in to
 * @property {object=} options Options passed into the visualisation
 * @property {function=} onRender Callback function called after rendering successfully
 * @property {function(RenderError)=} onError Callback function called if an error occurs
 * @property {Plugin[]} [plugins] plugins passed into the visualisation
 * @property {string=} id For existing objects: Engine identifier of object to render
 * @property {string=} type For creating objects: Type of visualisation to render
 * @property {string=} version For creating objects: Version of visualization to render
 * @property {(Field[])=} fields For creating objects: Data fields to use
 * @property {boolean=} [extendProperties=false] For creating objects: Whether to deeply extend properties or not. If false then subtrees will be overwritten.
 * @property {qix.GenericObjectProperties=} properties For creating objects: Explicit properties to set
 * @example
 * // A config for Creating objects:
 * const createConfig = {
 *   type: 'bar',
 *   element: document.querySelector('.bar'),
 *   extendProperties: true,
 *   fields: ['[Country names]', '=Sum(Sales)'],
 *   properties: {
 *     legend: {
 *       show: false,
 *     },
 *   }
 * };
 * nebbie.render(createConfig);
 * // A config for rendering an existing object:
 * const createConfig = {
 *   id: 'jG5LP',
 *   element: document.querySelector('.line'),
 * };
 * nebbie.render(createConfig);
 */
export default async function createSessionObject(
  { type, version, fields, properties, options, plugins, element, extendProperties, navigation, onRender, onError },
  halo,
  store
) {
  let mergedProps = {};
  const children = [];
  const { modelStore, subscribe } = store;
  let error;
  try {
    const t = halo.types.get({ name: type, version });
    mergedProps = await t.initialProperties(properties, extendProperties);
    const sn = await t.supernova();
    if (fields) {
      await populateData(
        {
          sn,
          properties: mergedProps,
          fields,
          children,
        },
        halo
      );
    }
    if (properties && sn && sn.qae.properties.onChange) {
      sn.qae.properties.onChange.call({}, mergedProps);
    }
  } catch (e) {
    error = e;
    // minimal dummy object properties to allow it to be created
    // and rendered with the error
    mergedProps = {
      qInfo: {
        qType: type,
      },
      visualization: type,
    };
    // console.error(e); // eslint-disable-line
  }
  const model = await halo.app.createSessionObject(mergedProps);
  if (children.length > 0) {
    await model.setFullPropertyTree({
      qProperty: mergedProps,
      qChildren: children,
    });
  }
  modelStore.set(model.id, model);
  const unsubscribe = subscribe(model);
  const onDestroy = async () => {
    await halo.app.destroySessionObject(model.id);
    unsubscribe();
  };
  return init(model, { options, plugins, element, onRender, onError }, halo, navigation, error, onDestroy);
}
