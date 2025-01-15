/* eslint no-underscore-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint lines-between-class-members: 0 */
import {
  hook,
  initiate,
  teardown,
  run,
  runSnaps,
  runMenu,
  observeActions,
  focus,
  blur,
  getImperativeHandle,
  updateRectOnNextRun,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  usePromise,
  useAction,
  useRect,
  useModel,
  useApp,
  useGlobal,
  useElement,
  useSelections,
  useTheme,
  useLayout,
  useStaleLayout,
  useAppLayout,
  useTranslator,
  usePlugins,
  useConstraints,
  useOptions,
  onTakeSnapshot,
  onContextMenu,
  useEmbed,
  useInteractionState,
  useRef,
} from '../hooks';

describe('hooks', () => {
  let c;
  let sandbox;
  let DEV;
  let frame;

  beforeAll(() => {
    frame = () =>
      new Promise((resolve) => {
        setTimeout(resolve);
      });
    DEV = global.__NEBULA_DEV__;
    global.__NEBULA_DEV__ = true;

    // thrown errors are caught in hooks.js and logged instead using console.error,
    // so if an error occurs we won't know it.
    // we therefore stub the console.error method and throw the error
    // so that a test fails properly
    if (!global.requestAnimationFrame) {
      global.requestAnimationFrame = (cb) => setTimeout(cb, 20);
      global.cancelAnimationFrame = clearTimeout;
    }
  });

  afterAll(() => {
    global.__NEBULA_DEV__ = DEV;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('hook should bind hooks to file scope', () => {
    const fn = 'fn';
    const h = hook(fn);
    expect(h).toEqual({
      __hooked: true,
      fn: 'fn',
      initiate,
      run,
      teardown,
      runMenu,
      runSnaps,
      focus,
      blur,
      observeActions,
      getImperativeHandle,
      updateRectOnNextRun,
    });
  });

  test('should throw when hook is used outside method context', () => {
    const fn = () => useState(0);

    expect(fn).toThrow('Invalid stardust hook call. Hooks can only be called inside a visualization component.');
  });

  test('should throw when hooks are used outside top level of method context', async () => {
    jest.useFakeTimers();
    // kill the error message in this test which comes from "../hooks.js:131"
    global.console = {
      ...global.console,
      error: jest.fn(),
    };

    c = {};
    initiate(c);

    c.fn = () => {
      useEffect(() => {
        useState(0);
      });
    };

    run(c);

    try {
      run(c);
      jest.advanceTimersByTime(60);
    } catch (error) {
      expect(error.message).toBe(
        'Invalid stardust hook call. Hooks can only be called inside a visualization component.'
      );
    }
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('teardown', () => {
    test('should teardown hooks', () => {
      const teardownMock = jest.fn();
      c = {
        __hooks: {
          list: [{ teardown: teardownMock }],
          pendingEffects: ['a'],
          pendingLayoutEffects: ['a'],
          actions: { list: [] },
          accessibility: {
            setter: null,
          },
        },
      };

      teardown(c);
      expect(teardownMock).toHaveBeenCalledTimes(1);

      expect(c.__hooks).toEqual({
        obsolete: true,
        list: [],
        pendingEffects: [],
        pendingLayoutEffects: [],
        actions: null,
        imperativeHandle: null,
        resizer: null,
        accessibility: null,
      });

      expect(c.__actionsDispatch).toBe(null);
    });
  });

  describe('runSnaps', () => {
    test('should run snaps hooks', async () => {
      const take1 = (layout) => Promise.resolve({ take1: 'yes', ...layout });

      c = {
        __hooks: {
          snaps: [{ fn: take1 }],
        },
      };

      const s = await runSnaps(c, { a: '1' });
      expect(s).toEqual({ a: '1', take1: 'yes' });
    });
  });

  describe('runMenu', () => {
    it('should run menu hooks', async () => {
      const take1 = (menu, event) => Promise.resolve({ take1: 'yes', menu, event });

      c = {
        __hooks: {
          menus: [{ fn: take1 }],
        },
      };

      const s = await runMenu(c, { a: '1' }, { b: '2' });
      expect(s).toEqual({ event: { b: '2' }, menu: { a: '1' }, take1: 'yes' });
    });
  });

  describe('useState', () => {
    beforeEach(() => {
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    test('should initiate state with value', () => {
      let countValue;
      c.fn = () => {
        [countValue] = useState(7);
      };

      run(c);
      expect(countValue).toBe(7);
    });

    test('should initiate state with function', () => {
      let countValue;
      c.fn = () => {
        [countValue] = useState(() => 7);
      };

      run(c);
      expect(countValue).toBe(7);
    });

    test('should update state value', async () => {
      let setter;
      let countValue;
      c.fn = () => {
        [countValue, setter] = useState(7);
      };

      run(c);
      expect(countValue).toBe(7);
      setter(12);
      await frame();
      expect(countValue).toBe(12);
    });

    test('should throw error when setState is called on an unmounted component', async () => {
      let setter;
      let countValue;
      c.fn = () => {
        [countValue, setter] = useState(7);
      };

      await run(c);
      c.__hooks.obsolete = true;
      expect(() => setter()).toThrow(
        'Calling setState on an unmounted component is a no-op and indicates a memory leak in your component.'
      );
      expect(countValue).toBe(7);
    });

    test('should update state value based on previous', async () => {
      let setter;
      let countValue;
      c.fn = () => {
        [countValue, setter] = useState(7);
      };

      run(c);
      expect(countValue).toBe(7);
      setter((prev) => prev + 2);
      await frame();
      expect(countValue).toBe(9);
    });

    test('should not re-render when state has not changed', async () => {
      let setter;
      let num = 0;
      c.fn = () => {
        [, setter] = useState(7);
        ++num;
      };

      run(c);
      expect(num).toBe(1);
      setter(7);
      await frame();
      expect(num).toBe(1);
    });

    test('should re-render only once when multiple states have changed', async () => {
      let setA;
      let setB;
      let setC;
      let num = 0;
      c.fn = () => {
        [, setA] = useState(7);
        [, setB] = useState(-4);
        [, setC] = useState(0);
        ++num;
      };

      run(c);
      expect(num).toBe(1);
      setA(8);
      setB(-3);
      setC(1);
      await frame();
      expect(num).toBe(2);
    });
  });

  describe('useRef', () => {
    beforeEach(() => {
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });
    test('should initiate ref with value', () => {
      let countValue;
      c.fn = () => {
        countValue = useRef(7);
      };

      run(c);
      expect(countValue.current).toBe(7);
    });
    test('should refer to the same object', async () => {
      let countValue;
      let firstObject;
      c.fn = () => {
        countValue = useRef(7);
        if (!firstObject) {
          firstObject = countValue;
        }
      };

      run(c);
      expect(countValue.current).toBe(7);
      countValue.current = 11;
      run(c);
      await frame();
      expect(countValue.current).toBe(11);
      expect(firstObject).toBe(countValue);
    });
    test('should not re-render when the ref changes', async () => {
      let num = 0;
      let countValue;
      c.fn = () => {
        countValue = useRef(7);
        ++num;
      };

      run(c);
      expect(countValue.current).toBe(7);
      countValue.current = 11;
      expect(num).toBe(1);
      await frame();
      expect(num).toBe(1);
      expect(countValue.current).toBe(11);
    });
  });

  describe('useMemo', () => {
    beforeEach(() => {
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    test('should run only when deps change', () => {
      const stub = jest.fn();
      stub.mockReturnValueOnce(5).mockReturnValueOnce(6);
      let dep = 'a';
      let value;
      c.fn = () => {
        value = useMemo(stub, [dep]);
      };

      run(c);
      run(c);
      expect(value).toBe(5);

      dep = 'b';
      run(c);
      expect(value).toBe(6);
    });
  });

  describe('useEffect', () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    let spy;

    beforeEach(() => {
      spy = jest.fn();
      c = {};
      initiate(c);
      jest.useFakeTimers();
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 20));
    });
    afterEach(() => {
      teardown(c);
      jest.useRealTimers();
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    afterAll(() => {
      window.requestAnimationFrame = originalRequestAnimationFrame;
    });

    test('should run once even when called multiple times', () => {
      c.fn = () => {
        useEffect(spy);
      };

      run(c);
      run(c);
      run(c);
      jest.advanceTimersByTime(20);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('without deps should run after every "frame"', () => {
      c.fn = () => {
        useEffect(spy);
      };

      run(c);
      jest.advanceTimersByTime(20);
      run(c);
      jest.advanceTimersByTime(20);
      run(c);
      jest.advanceTimersByTime(20);
      expect(spy).toHaveBeenCalledTimes(3);
    });

    test('with deps should run only when deps change', () => {
      let dep1 = 'a';
      let dep2 = 0;
      c.fn = () => {
        useEffect(spy, [dep1, dep2]);
      };

      run(c);
      jest.advanceTimersByTime(20);

      dep1 = 'b';
      run(c);
      jest.advanceTimersByTime(20);
      expect(spy).toHaveBeenCalledTimes(2);

      dep2 = false;
      run(c);
      jest.advanceTimersByTime(20);
      expect(spy).toHaveBeenCalledTimes(3);
    });

    test('should cleanup previous', async () => {
      const f = () => spy;
      c.fn = () => {
        useEffect(f);
      };

      run(c); // initial render
      jest.advanceTimersByTime(20);
      run(c); // should cleanup previous effects on second render
      jest.advanceTimersByTime(20);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('usePromise', () => {
    beforeEach(() => {
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    test('should resolve run-phase when pending promises are resolved', async () => {
      let reject;
      let resolve;
      const prom1 = new Promise((r) => {
        resolve = r;
      });
      const prom2 = new Promise((r, j) => {
        reject = j;
      });
      let v1;
      let v2;
      c.fn = () => {
        [v1] = usePromise(() => prom1, ['']);
        [, v2] = usePromise(() => prom2, ['']);
      };

      const p = run(c);

      reject('rej');
      resolve('res');
      await p;
      expect([v1, v2]).toEqual(['res', 'rej']);
    });
  });

  describe('useImperativeHandle', () => {
    let stub;
    beforeEach(() => {
      stub = jest.fn();
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    test('should store handle', async () => {
      stub.mockReturnValue({
        foo: 'meh',
      });
      c.fn = () => {
        useImperativeHandle(stub, []);
      };

      await run(c);
      expect(stub).toHaveBeenCalledTimes(1);
    });

    test('should maintain reference', async () => {
      const ret = {
        foo: 'meh',
      };
      stub.mockReturnValue(ret);
      c.fn = () => {
        useImperativeHandle(stub, []);
      };

      await run(c);
      await run(c);
      expect(c.__hooks.list[0].value[1]).toEqual(ret);
      expect(c.__hooks.imperativeHandle).toEqual(ret);
    });

    test('should throw when used multiple times', async () => {
      const ret = {
        foo: 'meh',
      };
      stub.mockReturnValue(ret);
      c.fn = () => {
        useImperativeHandle(stub, []);
        useImperativeHandle(stub, []);
      };

      try {
        await run(c);
      } catch (error) {
        expect(error.message).toBe('useImperativeHandle already used.');
      }
    });

    test('should return handle', async () => {
      stub.mockReturnValue({
        foo: 'meh',
      });
      c.fn = () => {
        useImperativeHandle(stub, []);
      };

      await run(c);
      expect(getImperativeHandle(c)).toEqual({ foo: 'meh' });
    });
  });

  describe('useAction', () => {
    let stub;
    let spy;

    beforeEach(() => {
      stub = jest.fn();
      spy = jest.fn();
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    test('should execute callback', async () => {
      let act;
      stub.mockReturnValue({
        action: spy,
      });
      c.fn = () => {
        act = useAction(stub, []);
      };

      run(c);
      expect(stub).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledTimes(0);

      act();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('should maintain reference', async () => {
      stub.mockReturnValue({
        action: 'action',
        icon: 'ic',
        label: 'meh',
        active: true,
        disabled: true,
        hidden: true,
      });
      c.fn = () => {
        useAction(stub, []);
      };

      run(c);

      const ref = c.__hooks.list[0].value[0];

      expect(ref.active).toBe(true);
      expect(ref.getSvgIconShape()).toBe('ic');
      expect(ref.disabled).toBe(true);
      expect(ref.hidden).toBe(true);
      expect(ref.label).toBe('meh');
    });

    test('should observe actions before init ', async () => {
      const unitiatedComponent = {};

      observeActions(unitiatedComponent, spy);
      expect(unitiatedComponent.__actionsDispatch).toEqual(spy);
    });

    test('should dispatch actions immediately', async () => {
      observeActions(c, spy);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.lastCall[0]).toEqual([]);
    });

    test('should dispatch actions only once after initial', async () => {
      c.fn = () => {
        useAction(() => ({ key: 'nyckel' }), []);
        useAction(() => ({ key: 'nyckel2' }), []);
        useAction(() => ({ key: 'nyckel3' }), []);
      };

      observeActions(c, spy);
      expect(spy).toHaveBeenCalledTimes(1);

      run(c);
      run(c);
      expect(spy).toHaveBeenCalledTimes(2);

      expect(spy.mock.lastCall[0].map((a) => a.key)).toEqual(['nyckel', 'nyckel2', 'nyckel3']);
    });
  });

  describe('useRect', () => {
    let element;

    describe('with ResizeObserver', () => {
      const originalRO = global.ResizeObserver;
      let RO;
      let RO_;
      let getBoundingClientRectMock;
      let observeMock;
      let unobserveMock;
      let disconnectMock;

      if (typeof ResizeObserver !== 'undefined') {
        // eslint-disable-next-line
        console.error('Existing ResizeObserver is about to be overridden');
      }
      beforeEach(() => {
        getBoundingClientRectMock = jest.fn();
        observeMock = jest.fn();
        unobserveMock = jest.fn();
        disconnectMock = jest.fn();

        element = {
          getBoundingClientRect: getBoundingClientRectMock,
        };

        RO = jest.fn();
        RO_ = {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: disconnectMock,
        };
        RO.mockReturnValue(RO_);

        global.ResizeObserver = RO;
        c = {
          context: {
            element,
          },
        };
        initiate(c);
      });
      afterEach(() => {
        teardown(c);
        global.ResizeObserver = originalRO;
        jest.resetAllMocks();
        jest.restoreAllMocks();
      });

      test('should return rect', () => {
        let r;
        getBoundingClientRectMock.mockReturnValue({ left: 1, top: 2, width: 3, height: 4 });
        c.fn = () => {
          r = useRect();
        };

        run(c);
        expect(r).toEqual({ left: 1, top: 2, width: 3, height: 4 });
      });

      test('should observe changes', () => {
        getBoundingClientRectMock.mockReturnValue({ left: 1, top: 2, width: 3, height: 4 });

        c.fn = () => {
          useRect();
        };

        run(c);
        expect(RO_.observe).toHaveBeenCalledWith(element);
        teardown(c);
        expect(RO_.unobserve).toHaveBeenCalledWith(element);
        expect(RO_.disconnect).toHaveBeenCalledWith(element);
      });

      test('should update rect when size changes ', async () => {
        let r;
        getBoundingClientRectMock.mockReturnValue({ left: 1, top: 2, width: 3, height: 4 });

        c.fn = () => {
          r = useRect();
        };

        run(c);
        const handler = RO.mock.lastCall[0];
        getBoundingClientRectMock.mockReturnValue({ left: 1, top: 2, width: 3, height: 5 });

        handler();
        await frame();
        expect(r).toEqual({ left: 1, top: 2, width: 3, height: 5 });
      });
    });

    describe.skip('without ResizeObserver', () => {
      const originalW = global.window;
      const originalRO = global.ResizeObserver;

      beforeEach(() => {
        global.ResizeObserver = undefined;
        global.window = {
          addEventListener: sandbox.stub(),
          removeEventListener: sandbox.stub(),
        };
        element = {
          getBoundingClientRect: sandbox.stub(),
        };

        c = {
          context: {
            element,
          },
        };
        initiate(c);
      });
      afterEach(() => {
        teardown(c);
        global.window = originalW;
        global.ResizeObserver = originalRO;
      });

      test('should observe changes', () => {
        element.getBoundingClientRect.returns({ left: 1, top: 2, width: 3, height: 4 });
        c.fn = () => {
          useRect();
        };

        run(c);
        const add = global.window.addEventListener.getCall(0).args;
        expect(add[0]).to.equal('resize');
        expect(add[1]).to.be.a('function');

        teardown(c);

        const remove = global.window.removeEventListener.getCall(0).args;
        expect(remove[0]).to.equal('resize');
        expect(remove[1]).to.equal(add[1]);
      });
    });

    describe('with explicit resize', () => {
      const originalRO = global.ResizeObserver;
      let RO;
      let getBoundingClientRectMock;

      if (typeof ResizeObserver !== 'undefined') {
        // eslint-disable-next-line
        console.error('Existing ResizeObserver is about to be overridden');
      }
      beforeEach(() => {
        getBoundingClientRectMock = jest.fn();
        element = {
          getBoundingClientRect: getBoundingClientRectMock,
        };

        RO = jest.fn();
        // mock ResizeObserver just to check that the ResizeObserver code in useRect itself isn't reached.
        // the test should throw due to missing observe method otherwise
        global.ResizeObserver = RO;
        c = {
          context: {
            element,
          },
        };
        initiate(c, {
          explicitResize: true,
        });
      });
      afterEach(() => {
        teardown(c);
        global.ResizeObserver = originalRO;
      });

      test('should update rect when scheduled', async () => {
        getBoundingClientRectMock.mockReturnValue({ left: 1, top: 2, width: 3, height: 4 });
        let r;
        let r2;
        c.fn = () => {
          r = useRect();
          r2 = useRect();
        };
        run(c);
        expect(r).toEqual({ left: 1, top: 2, width: 3, height: 4 });
        expect(r2).toEqual({ left: 1, top: 2, width: 3, height: 4 });

        getBoundingClientRectMock.mockReturnValue({ left: 1, top: 2, width: 3, height: 5 });
        updateRectOnNextRun(c);
        await run(c);
        expect(r).toEqual({ left: 1, top: 2, width: 3, height: 5 });
        expect(r2).toEqual({ left: 1, top: 2, width: 3, height: 5 });
      });
    });
  });

  describe('composed hooks', () => {
    beforeEach(() => {
      c = {};
      c.context = {
        model: { session: 'm' },
        app: { session: 'a' },
        global: { session: 'global' },
        selections: 'selections',
        element: 'element',
        theme: 'theme',
        translator: 'translator',
        plugins: 'plugins',
        nebbie: 'embed',
        layout: 'layout',
        appLayout: 'appLayout',
        constraints: 'constraints',
        interactions: 'interactions',
        options: 'options',
      };
      c.env = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    test('useModel', () => {
      let value;
      c.fn = () => {
        value = useModel();
      };
      run(c);
      expect(value).toEqual({ session: 'm' });

      c.context.model = {};
      run(c);
      expect(value).toBe(undefined);
    });

    test('useApp', () => {
      let value;
      c.fn = () => {
        value = useApp();
      };
      run(c);
      expect(value).toEqual({ session: 'a' });

      c.context.app = {};
      run(c);
      expect(value).toBe(undefined);
    });
    test('useGlobal', () => {
      let value;
      c.fn = () => {
        value = useGlobal();
      };
      run(c);
      expect(value).toEqual({ session: 'global' });

      c.context.global = {};
      run(c);
      expect(value).toBe(undefined);
    });
    test('useElement', () => {
      let value;
      c.fn = () => {
        value = useElement();
      };
      run(c);
      expect(value).toBe('element');
    });
    test('useSelections', () => {
      let value;
      c.fn = () => {
        value = useSelections();
      };
      run(c);
      expect(value).toBe('selections');
    });
    test('useTheme', () => {
      let value;
      c.fn = () => {
        value = useTheme();
      };
      run(c);
      expect(value).toBe('theme');
    });
    test('useLayout', () => {
      let value;
      c.fn = () => {
        value = useLayout();
      };
      run(c);
      expect(value).toBe('layout');
    });
    test('useStaleLayout', () => {
      let value;
      c.context.layout = { hc: 'h' };
      c.fn = () => {
        value = useStaleLayout();
      };
      run(c);
      c.context.layout = { hc: 'a', qSelectionInfo: { qInSelections: true } };
      run(c);
      expect(value).toEqual({ hc: 'h' });

      c.context.layout = { hc: 'a' };
      run(c);
      expect(value).toEqual({ hc: 'a' });
    });
    test('useAppLayout', () => {
      let value;
      c.fn = () => {
        value = useAppLayout();
      };
      run(c);
      expect(value).toBe('appLayout');
    });
    test('useTranslator', () => {
      let value;
      c.fn = () => {
        value = useTranslator();
      };
      run(c);
      expect(value).toBe('translator');
    });
    test('usePlugins', () => {
      let value;
      c.fn = () => {
        value = usePlugins();
      };
      run(c);
      expect(value).toBe('plugins');
    });
    test('useConstraints', () => {
      let value;
      c.fn = () => {
        value = useConstraints();
      };
      run(c);
      expect(value).toBe('constraints');
    });
    test('useInteractionState', () => {
      let value;
      c.fn = () => {
        value = useInteractionState();
      };
      run(c);
      expect(value).toBe('interactions');
    });
    test('useOptions', () => {
      let value;
      c.fn = () => {
        value = useOptions();
      };
      run(c);
      expect(value).toBe('options');
    });
    test('onTakeSnapshot', () => {
      const spy = jest.fn();
      c.fn = () => {
        onTakeSnapshot(spy);
      };
      run(c);
      c.__hooks.snaps[0].fn();
      expect(spy).toHaveBeenCalledTimes(1);
    });
    test('onContextMenu', () => {
      const spy = jest.fn();
      c.fn = () => {
        onContextMenu(spy);
      };
      run(c);
      c.__hooks.menus[0].fn();
      expect(spy).toHaveBeenCalledTimes(1);
    });
    test('useEmbed', () => {
      let value;
      c.fn = () => {
        value = useEmbed();
      };
      run(c);
      expect(value).toBe('embed');
    });
  });
});
