/* eslint-disable no-underscore-dangle */
import EventEmitter from 'node-event-emitter';
import { convertTo as conversionConvertTo } from '@nebula.js/conversion';
import { JSONPatch } from '@nebula.js/supernova';
import glueCell from './components/glue';
import getPatches from './utils/patcher';
import validatePlugins from './plugins/plugins';

const noopi = () => {};

export default function viz({ model, halo, initialError, onDestroy = async () => {} } = {}) {
  let unmountCell = noopi;
  let cellRef = null;
  let mountedReference = null;
  let onMount = null;
  let onRender = null;
  const mounted = new Promise((resolve) => {
    onMount = resolve;
  });

  const rendered = new Promise((resolve) => {
    onRender = resolve;
  });

  const createOnInitialRender = (override) => () => {
    override && override();
    onRender();
  };

  let initialSnOptions = {};
  let initialSnPlugins = [];

  const emitter = new EventEmitter();

  const setSnOptions = async (opts) => {
    const override = opts.onInitialRender;
    if (mountedReference) {
      (async () => {
        await mounted;
        cellRef.current.setSnOptions({
          ...initialSnOptions,
          ...opts,
          ...{
            onInitialRender: createOnInitialRender(override),
          },
        });
      })();
    } else {
      // Handle setting options before mount
      initialSnOptions = {
        ...initialSnOptions,
        ...opts,
        ...{
          onInitialRender: createOnInitialRender(override),
        },
      };
    }
  };

  const setSnPlugins = async (plugins) => {
    validatePlugins(plugins);
    if (mountedReference) {
      (async () => {
        await mounted;
        cellRef.current.setSnPlugins(plugins);
      })();
    } else {
      // Handle setting plugins before mount
      initialSnPlugins = plugins;
    }
  };

  /**
   * @class
   * @alias Viz
   * @classdesc A controller to further modify a visualization after it has been rendered.
   * @example
   * const viz = await embed(app).render({
   *   element,
   *   type: 'barchart'
   * });
   * viz.destroy();
   */
  const api = /** @lends Viz# */ {
    /**
     * The id of this visualization's generic object.
     * @type {string}
     */
    id: model.id,
    /**
     * This visualizations Enigma model, a representation of the generic object.
     * @type {EngineAPI.IGenericObject}
     */
    model,
    /**
     * Destroys the visualization and removes it from the the DOM.
     * @example
     * const viz = await embed(app).render({
     *   element,
     *   id: 'abc'
     * });
     * viz.destroy();
     */
    async destroy() {
      await onDestroy();
      unmountCell();
      unmountCell = noopi;
    },
    /**
     * Converts the visualization to a different registered type
     * @since 1.1.0
     * @param {string} newType - Which registered type to convert to.
     * @param {boolean=} forceUpdate - Whether to run setProperties or not, defaults to true.
     * @returns {Promise<object>} Promise object that resolves to the full property tree of the converted visualization.
     * @example
     * const viz = await embed(app).render({
     *   element,
     *   id: 'abc'
     * });
     * viz.convertTo('barChart');
     */
    async convertTo(newType, forceUpdate = true) {
      const propertyTree = await conversionConvertTo({ halo, model, cellRef, newType });
      if (forceUpdate) {
        const layout = await model.getLayout();
        if (layout.qMeta.privileges.indexOf('update') !== -1) {
          if (model.__snInterceptor) {
            await model.__snInterceptor.setProperties.call(model, propertyTree.qProperty);
          } else {
            await model.setProperties(propertyTree.qProperty);
          }
        } else {
          const prevProps = await model.getProperties();
          // calculate new patches from after change
          const newPatches = JSONPatch.generate(prevProps, propertyTree.qProperty).map((p) => ({
            qOp: p.op,
            qValue: typeof p.value === 'string' ? p.value : JSON.stringify(p.value),
            qPath: p.path,
          }));
          if (model.__snInterceptor) {
            await model.__snInterceptor.applyPatches.call(model, newPatches, true);
          } else {
            await model.applyPatches(newPatches, true);
          }
        }
      }
      return propertyTree;
    },
    /**
     * Listens to custom events from inside the visualization. See useEmitter
     * @experimental
     * @param {string} eventName Event name to listen to
     * @param {Function} listener Callback function to invoke
     */
    addListener(eventName, listener) {
      emitter.addListener(eventName, listener);
    },
    /**
     * Removes a listener
     * @experimental
     * @param {string} eventName Event name to remove from
     * @param {Function} listener Callback function to remove
     */
    removeListener(eventName, listener) {
      emitter.removeListener(eventName, listener);
    },
    /**
     * Gets the specific api that a Viz exposes.
     * @returns {Promise<object>} object that contains the internal Viz api.
     */
    async getImperativeHandle() {
      await rendered;
      return cellRef.current.getImperativeHandle();
    },
    // ===== unexposed experimental API - use at own risk ======
    __DO_NOT_USE__: {
      mount(element) {
        if (mountedReference) {
          throw new Error('Already mounted');
        }
        mountedReference = element;
        [unmountCell, cellRef] = glueCell({
          halo,
          element,
          model,
          initialSnOptions,
          initialSnPlugins,
          initialError,
          onMount,
          emitter,
        });
        return mounted;
      },
      async applyProperties(props) {
        const current = await model.getEffectiveProperties();
        const patches = getPatches('/', props, current);
        if (patches.length) {
          return model.applyPatches(patches, true);
        }
        return undefined;
      },
      options(opts) {
        setSnOptions(opts);
      },
      plugins(plugins) {
        setSnPlugins(plugins);
      },
      exportImage() {
        return cellRef.current.exportImage();
      },
      takeSnapshot() {
        return cellRef.current.takeSnapshot();
      },
      getModel() {
        return model;
      },
    },

    // old QVisualization API
    // close() {},
    // exportData() {},
    // exportImg() {},
    // exportPdf() {},
    // setOptions() {}, // applied soft patch
    // resize() {},
    // show() {},
    // toggleDataView() {},
  };

  return api;
}
