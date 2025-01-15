/* eslint-disable no-underscore-dangle */
import EventEmitter from 'node-event-emitter';
import { convertTo as conversionConvertTo } from '@nebula.js/conversion';
import glueCell from './components/glue';
import getPatches from './utils/patcher';
import validatePlugins from './plugins/plugins';
import canSetProperties from './utils/can-set-properties';
import setProperties from './utils/set-properties';
import saveSoftProperties from './utils/save-soft-properties';

const noopi = () => {};

export default function viz({
  model,
  halo,
  navigation,
  initialError,
  onDestroy = async () => {},
  onRender = () => {},
  onError = () => {},
} = {}) {
  let unmountCell = noopi;
  let cellRef = null;
  let mountedReference = null;
  let onMount = null;
  let onRenderResolve = null;
  let viewDataObjectId;
  const mounted = new Promise((resolve) => {
    onMount = resolve;
  });

  const rendered = new Promise((resolve) => {
    onRenderResolve = resolve;
  });

  const createOnInitialRender = (override) => () => {
    override?.(); // from options.onInitialRender
    onRenderResolve(); // internal promise in viz to wait for render
    onRender(); // from RenderConfig
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
     * @type {qix.GenericObject}
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
     * Converts the visualization to a different registered type.
     *
     * Will update properties if permissions allow, else will patch (can be forced with forcePatch parameter)
     *
     * Not all chart types are compatible, similar structures are required.
     *
     * @since 1.1.0
     * @param {string} newType - Which registered type to convert to.
     * @param {boolean=} forceUpdate - Whether to apply the change or not, else simply returns the resulting properties, defaults to true.
     * @param {boolean=} forcePatch - Whether to always patch the change instead of making a permanent change
     * @throws {Error} Throws an error if the source or target chart does not support conversion
     * @returns {Promise<object>} Promise object that resolves to the full property tree of the converted visualization.
     * @example
     * const viz = await embed(app).render({
     *   element,
     *   id: 'abc'
     * });
     * await viz.convertTo('barChart');
     * // Change the barchart to a linechart, only in the current session
     * const newProperties = await viz.convertTo('lineChart', false, true);
     * // Remove the conversion by clearing the patches
     * await viz.model.clearSoftPatches();
     */
    async convertTo(newType, forceUpdate = true, forcePatch = false) {
      if (forceUpdate) {
        const layout = await model.getLayout();
        if (canSetProperties(layout) && !forcePatch) {
          const propertyTree = await conversionConvertTo({ halo, model, cellRef, newType });
          await setProperties(model, propertyTree.qProperty);
          return propertyTree;
        }
        const oldProperties = await model.getEffectiveProperties();
        const propertyTree = await conversionConvertTo({ halo, model, cellRef, newType, properties: oldProperties });
        const newProperties = propertyTree.qProperty;
        await saveSoftProperties(model, oldProperties, newProperties);
        return propertyTree;
      }
      const propertyTree = await conversionConvertTo({ halo, model, cellRef, newType });
      return propertyTree;
    },
    /**
     * Toggles the chart to a data view of the chart.
     *
     * The chart will be toggled to the type defined in the nebula context (dataViewType).
     *
     * The default dataViewType for nebula is sn-table. The specified chart type needs to be registered as well, in order to make it possible to render the data view.
     *
     * @experimental
     * @since 4.9.0
     * @param {boolean=} showDataView - If included, forces the chart into a specific state. True will show data view, and false will show the original chart. If not included it will always toggle between the two views.
     */
    async toggleDataView(showDataView) {
      let newModel;
      if (!viewDataObjectId && showDataView !== false) {
        let newType = halo.config.context.dataViewType;
        const oldProperties = await model.getEffectiveProperties();
        // Check if dataViewType is registered. Otherwise potentially fallback to table
        if (!halo.types.getSupportedVersion(newType)) {
          if (halo.types.getSupportedVersion('table')) {
            newType = 'table';
          } else {
            throw new Error('No data view type registered');
          }
        }

        const propertyTree = await conversionConvertTo({
          halo,
          model,
          cellRef,
          newType,
          properties: oldProperties,
          viewDataMode: true,
        });
        newModel = await halo.app.createSessionObject(propertyTree.qProperty);
        viewDataObjectId = newModel.id;
      } else if (viewDataObjectId && showDataView !== true) {
        newModel = model;
        await halo.app.destroySessionObject(viewDataObjectId);
        viewDataObjectId = undefined;
      }
      if (newModel) {
        cellRef.current.setModel(newModel);
      }
    },
    /**
     * Listens to custom events from inside the visualization. See useEmitter
     * @param {string} eventName Event name to listen to
     * @param {Function} listener Callback function to invoke
     */
    addListener(eventName, listener) {
      emitter.addListener(eventName, listener);
    },
    /**
     * Removes a listener
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
    /**
     * Takes a snapshot of the Viz layout and state
     * @experimental
     * @private
     * @returns {Promise<object>} viz layout object with snapshot settings
     */
    async takeSnapshot() {
      await rendered;
      return cellRef.current.takeSnapshot();
    },
    // ===== unexposed experimental API - use at own risk ======
    __DO_NOT_USE__: {
      mount(element) {
        if (mountedReference) {
          throw new Error('Already mounted');
        }
        if (!(element instanceof HTMLElement)) {
          throw new Error('Provided element is not a proper HTMLElement');
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
          navigation,
          onError,
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
      /**
       * Contains functionality related to conversions between types in the current session
       * @memberof Viz#
       * @ignore
       * @since 4.5.0
       */
      convert: {
        /**
         * Converts the visualization to a different registered type using a patch. Only persists in session
         * @since 4.5.0
         * @ignore
         * @memberof Viz.convert
         * @param {string} newType - Which registered type to convert to.
         * @throws {Error} Throws an error if the source or target chart does not support conversion
         * @returns {Promise<object>} Promise object that resolves to the full property tree of the converted visualization.
         * @example
         * const viz = await embed(app).render({
         *   element,
         *   id: 'abc'
         * });
         * viz.convert.toType('barChart');
         */
        async toType(newType) {
          const oldProperties = await model.getEffectiveProperties();
          const propertyTree = await conversionConvertTo({ halo, model, cellRef, newType, properties: oldProperties });
          const newProperties = propertyTree.qProperty;
          await saveSoftProperties(model, oldProperties, newProperties);
          return propertyTree;
        },
        /**
         * Reverts any conversion done on the visualization
         * @since 4.5.0
         * @ignore
         * @memberof Viz.convert
         * @returns {Promise<object>} Promise object that resolves when the conversion is undone, returns result.
         * @example
         * const viz = await embed(app).render({
         *   element,
         *   id: 'abc'
         * });
         * viz.convert.toType('barChart');
         * viz.convert.revert();
         */
        async revert() {
          await model.clearSoftPatches();
        },
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
  };

  return api;
}
