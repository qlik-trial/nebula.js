/* eslint no-underscore-dangle: 0 */

import EventEmitter from 'node-event-emitter';

import JSONPatch from './json-patch';
import actionhero from './action-hero';

import { hook, run } from './hooks';

const defaultComponent = {
  app: null,
  model: null,
  actions: null,
  selections: null,
  created: () => {},
  mounted: () => {},
  render: () => {},
  resize: () => {},
  willUnmount: () => {},
  destroy: () => {},
  emit: () => {},
  getViewState: () => {},

  // temporary
  observeActions() {},
  setSnapshotData: (snapshot) => Promise.resolve(snapshot),
};

const reservedKeys = Object.keys(defaultComponent);

const mixin = (obj) => {
  /* eslint no-param-reassign: 0 */
  Object.keys(EventEmitter.prototype).forEach((key) => {
    obj[key] = EventEmitter.prototype[key];
  });
  EventEmitter.init(obj);
  return obj;
};

function createWithHooks(generator, opts, galaxy) {
  if (__NEBULA_DEV__) {
    if (generator.component.run !== run) {
      // eslint-disable-next-line no-console
      console.warn('Detected multiple supernova modules, this might cause problems.');
    }
  }
  const qGlobal = opts.app && opts.app.session ? opts.app.session.getObjectApi({ handle: -1 }) : undefined;

  // use a deep comparison for 'small' objects
  let hasRun = false;
  const current = {};
  const deepCheck = ['appLayout', 'constraints', 'interactions'];
  const forcedConstraints = {};
  const forcedInteractions = {};

  // select should be a constraint when a real model is not available
  if (!opts.model || !opts.model.session) {
    forcedConstraints.select = true;
    forcedConstraints.edit = true;
    forcedInteractions.select = false;
    forcedInteractions.edit = false;
  }

  const c = {
    context: {
      // static values that are not expected to
      // change during the component's life
      // --------------------
      model: opts.model,
      app: opts.app,
      global: qGlobal,
      selections: opts.selections,
      nebbie: opts.nebbie,
      element: undefined, // set on mount
      emitter: opts.emitter,
      // ---- singletons ----
      deviceType: galaxy.deviceType,
      theme: undefined,
      translator: galaxy.translator,
      navigation: opts.navigation,
      // --- dynamic values ---
      layout: {},
      appLayout: {},
      keyboardNavigation: opts.keyboardNavigation,
      focusHandler: opts.focusHandler,
      constraints: forcedConstraints,
      interactions: forcedInteractions,
      options: {},
      plugins: [],
    },
    fn: generator.component.fn,
    created() {},
    mounted(element) {
      this.context.element = element;
      generator.component.initiate(c, {
        explicitResize: !!opts.explicitResize,
      });
    },
    render(r) {
      let changed = !hasRun || false;

      if (r) {
        if (r.layout && r.layout !== this.context.layout) {
          changed = true;
          this.context.layout = r.layout;
        }
        if (r.context && r.context.theme) {
          // changed is set further down only if the name is different
          this.context.theme = r.context.theme;
        }
        // false equals undefined, so we to cast to bool here
        if (r.context && !!r.context.keyboardNavigation !== !!this.context.keyboardNavigation) {
          this.context.keyboardNavigation = !!r.context.keyboardNavigation;
          changed = true;
        }

        if (r.context && r.context.focusHandler) {
          // Needs to be added here due to how the client renders
          this.context.focusHandler = r.context.focusHandler;
        }

        if (r.options) {
          // options could contain anything including methods, classes, cyclical references
          // so we can't use JSON parse for comparison.
          // but we can do a shallow reference check on the first level to check if
          // options have changed. if it has changed then create a new reference for
          // the options object to ensure callbacks are triggered
          const op = {};
          let opChanged = false;
          Object.keys(r.options).forEach((key) => {
            op[key] = r.options[key];
            if (this.context.options[key] !== r.options[key]) {
              opChanged = true;
            }
          });
          if (opChanged) {
            this.context.options = op;
            changed = true;
          }
        }

        if (r.plugins) {
          let pluginsChanged = this.context.plugins.length !== r.plugins.length;
          r.plugins.forEach((plugin, index) => {
            if (this.context.plugins[index] !== plugin) {
              pluginsChanged = true;
            }
          });
          if (pluginsChanged) {
            this.context.plugins = [...r.plugins];
            changed = true;
          }
        }

        // do a deep check on 'small' objects
        deepCheck.forEach((key) => {
          const ref = r.context;
          if (ref && Object.prototype.hasOwnProperty.call(ref, key)) {
            let s = JSON.stringify(ref[key]);
            if (key === 'constraints') {
              s = JSON.stringify({ ...ref[key], ...forcedConstraints });
            }
            if (key === 'interactions') {
              s = JSON.stringify({ ...ref[key], ...forcedInteractions });
            }
            if (s !== current[key]) {
              changed = true;
              current[key] = s;
              // create new object reference to ensure useEffect/useMemo/useCallback
              // is triggered if the object is used a dependency
              this.context[key] = JSON.parse(s);
            }
          }
        });
      } else {
        changed = true;
      }

      // theme and translator are singletons so their reference won't change, we do
      // however need to observe if their internal content has changed (name, language) and
      // trigger an update if they have
      if (this.context.theme && this.context.theme.name() !== current.themeName) {
        changed = true;
        current.themeName = this.context.theme.name();
      }
      if (this.context.translator.language() !== current.language) {
        changed = true;
        current.language = c.context.translator.language();
      }

      // TODO - observe what hooks are used, and only trigger run if values associated
      // with those hooks have changed, i.e. if layout has changed but useLayout() isn't called
      // then there is no need to call run

      if (changed) {
        hasRun = true;
        this.currentResult = generator.component.run(this);
        return this.currentResult;
      }
      return this.currentResult || Promise.resolve();
    },
    resize() {
      // resize should never really by necesseary since the ResizeObserver
      // in useRect observes changes on the size of the object, the only time it might
      // be necessary is on IE 11 when the object is resized without the window changing size
      generator.component.updateRectOnNextRun(this);
      return this.render();
    },
    willUnmount() {
      generator.component.teardown(this);
    },
    setSnapshotData(layout) {
      return generator.component.runSnaps(this, layout);
    },
    onContextMenu(menu, event, menuBuilder, features, context) {
      return generator.component.runMenu(this, menu, event, menuBuilder, features, context);
    },
    focus() {
      generator.component.focus(this);
    },
    blur() {
      generator.component.blur(this);
    },
    getImperativeHandle() {
      return generator.component.getImperativeHandle(this);
    },
    destroy() {},
    observeActions(callback) {
      generator.component.observeActions(this, callback);
    },
    isHooked: true,
  };

  deepCheck.forEach((key) => {
    current[key] = JSON.stringify(c.context[key]);
  });
  current.themeName = c.context.theme ? c.context.theme.name() : undefined;
  current.language = c.context.translator ? c.context.translator.language() : undefined;

  Object.assign(c, {
    selections: opts.selections,
  });

  return [c, null];
}

function createClassical(generator, opts) {
  if (__NEBULA_DEV__) {
    // eslint-disable-next-line no-console
    console.warn('Obsolete API - time to get hooked!');
  }
  const componentInstance = {
    ...defaultComponent,
  };

  mixin(componentInstance);

  const userInstance = {
    emit(...args) {
      componentInstance.emit(...args);
    },
  };

  Object.keys(generator.component || {}).forEach((key) => {
    if (reservedKeys.indexOf(key) !== -1) {
      componentInstance[key] = generator.component[key].bind(userInstance);
    } else {
      userInstance[key] = generator.component[key];
    }
  });

  const hero = actionhero({
    sn: generator,
    component: userInstance,
  });

  const qGlobal = opts.app && opts.app.session ? opts.app.session.getObjectApi({ handle: -1 }) : null;

  Object.assign(userInstance, {
    model: opts.model,
    app: opts.app,
    global: qGlobal,
    selections: opts.selections,
    actions: hero.actions,
  });

  Object.assign(componentInstance, {
    actions: hero.actions,
    model: opts.model,
    app: opts.app,
    selections: opts.selections,
  });

  return [componentInstance, hero];
}

export default function create(generator, opts, galaxy) {
  if (typeof generator.component === 'function') {
    generator.component = hook(generator.component);
  }
  const [componentInstance, hero] =
    generator.component && generator.component.__hooked
      ? createWithHooks(generator, opts, galaxy)
      : createClassical(generator, opts);

  const teardowns = [];

  if (opts.model.__snInterceptor) {
    // remove old hook - happens only when proper cleanup hasn't been done
    opts.model.__snInterceptor.teardown();
  }

  if (generator.qae.properties.onChange) {
    // TODO - handle multiple sn
    // TODO - check privileges

    opts.model.__snInterceptor = {
      setProperties: opts.model.setProperties,
      applyPatches: opts.model.applyPatches,
      teardown: undefined,
    };

    opts.model.setProperties = function setProperties(...args) {
      // try/catch here to guard against charts not checking properties correctly
      try {
        generator.qae.properties.onChange.call({ model: opts.model }, ...args);
      } catch {
        if (__NEBULA_DEV__) {
          console.warn('Error in chart setProperties interceptor onChange call '); // eslint-disable-line no-console
        }
      }
      return opts.model.__snInterceptor.setProperties.call(this, ...args);
    };

    opts.model.applyPatches = function applyPatches(qPatches, qSoftPatch) {
      const method = qSoftPatch ? 'getEffectiveProperties' : 'getProperties';
      return opts.model[method]().then((currentProperties) => {
        // apply patches to current props
        const original = JSONPatch.clone(currentProperties);
        const patches = qPatches.map((p) => ({ op: p.qOp, value: JSON.parse(p.qValue), path: p.qPath }));
        JSONPatch.apply(currentProperties, patches);
        try {
          generator.qae.properties.onChange.call({ model: opts.model }, currentProperties);
        } catch {
          if (__NEBULA_DEV__) {
            console.warn('Error in chart applyPatches interceptor onChange call '); // eslint-disable-line no-console
          }
        }
        // calculate new patches from after change
        const newPatches = JSONPatch.generate(original, currentProperties).map((p) => ({
          qOp: p.op,
          qValue: JSON.stringify(p.value),
          qPath: p.path,
        }));

        return opts.model.__snInterceptor.applyPatches.call(this, newPatches, qSoftPatch);
      });
    };

    opts.model.__snInterceptor.teardown = () => {
      if (opts.model.__snInterceptor) {
        opts.model.setProperties = opts.model.__snInterceptor.setProperties;
        delete opts.model.__snInterceptor;
      }
    };

    teardowns.push(opts.model.__snInterceptor.teardown);
  }

  return {
    generator,
    component: componentInstance,
    selectionToolbar: {
      items: hero ? hero.selectionToolbarItems : [],
    },
    destroy() {
      teardowns.forEach((t) => t());
    },
    logicalSize: generator.definition.logicalSize || (() => false),
  };
}
