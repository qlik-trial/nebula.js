// File generated automatically by "@scriptappy/to-dts"; DO NOT EDIT.
import * as qix from '@qlik/api/qix';
/**
 * Initiates a new `Embed` instance using the specified enigma `app`.
 * @param app
 * @param instanceConfig
 */
export function embed(app: qix.Doc, instanceConfig?: stardust.Configuration): stardust.Embed;

export namespace embed {
    /**
     * Creates a new `embed` scope bound to the specified `configuration`.
     * 
     * The configuration is merged with all previous scopes.
     * @param configuration The configuration object
     */
    function createConfiguration(configuration: stardust.Configuration): typeof embed;

}

/**
 * Creates a stateful value.
 * @param initialState The initial state.
 */
export function useState<S>(initialState: S | (()=>S)): [S, stardust.SetStateFn<S>];

/**
 * Triggers a callback function when a dependent value changes.
 * 
 * Omitting the dependency array will have the hook run on each update
 * and an empty dependency array runs only once.
 * @param effect The callback.
 * @param deps The dependencies that should trigger the callback.
 */
export function useEffect(effect: stardust.EffectCallback, deps?: any[]): void;

/**
 * Creates a stateful value when a dependent changes.
 * @param factory The factory function.
 * @param deps The dependencies.
 */
export function useMemo<T>(factory: ()=>T, deps: any[]): T;

/**
 * Creates a reference to a value not needed for rendering
 * 
 * While Nebula does not have a virtual DOM, it is still useful
 * to have a reference to an object that is retained across
 * renders and in it self does not trigger a render.
 * @param initialValue The initial value.
 */
export function useRef<R>(initialValue: R): stardust.Ref<R>;

/**
 * Runs a callback function when a dependent changes.
 * 
 * Useful for async operations that otherwise cause no side effects.
 * Do not add for example listeners withing the callback as there is no teardown function.
 * @param factory The factory function that calls the promise.
 * @param deps The dependencies.
 */
export function usePromise<P>(factory: ()=>Promise<P>, deps?: any[]): [P, Error];

/**
 * Gets the HTMLElement this visualization is rendered into.
 */
export function useElement(): HTMLElement;

/**
 * Gets the size of the HTMLElement the visualization is rendered into.
 */
export function useRect(): stardust.Rect;

/**
 * Gets the layout of the generic object associated with this visualization.
 */
export function useLayout(): qix.GenericObjectLayout;

/**
 * Gets the layout of the generic object associated with this visualization.
 * 
 * Unlike the regular layout, a _stale_ layout is not changed when a generic object enters
 * the modal state. This is mostly notable in that `qSelectionInfo.qInSelections` in the layout is
 * always `false`.
 * The returned value from `useStaleLayout()` and `useLayout()` are identical when the object
 * is not in a modal state.
 */
export function useStaleLayout(): qix.GenericObjectLayout;

/**
 * Gets the layout of the app associated with this visualization.
 */
export function useAppLayout(): qix.NxAppLayout;

/**
 * Gets the generic object API of the generic object connected to this visualization.
 */
export function useModel(): qix.GenericObject | undefined;

/**
 * Gets the doc API.
 */
export function useApp(): qix.Doc | undefined;

/**
 * Gets the global API.
 */
export function useGlobal(): qix.Global | undefined;

/**
 * Gets the object selections.
 */
export function useSelections(): stardust.ObjectSelections;

/**
 * Gets the theme.
 */
export function useTheme(): stardust.Theme;

/**
 * Gets the embed instance used.
 */
export function useEmbed(): stardust.Embed;

/**
 * Gets the translator.
 */
export function useTranslator(): stardust.Translator;

/**
 * Gets the device type. ('touch' or 'desktop')
 */
export function useDeviceType(): string;

/**
 * Gets the navigation api to control sheet navigation. When useNavigation is used in Sense, it returns Sense.navigation.
 */
export function useNavigation(): stardust.Navigation;

/**
 * Gets the array of plugins provided when rendering the visualization.
 */
export function usePlugins(): stardust.Plugin[];

/**
 * Registers a custom action.
 * @param factory
 * @param deps
 */
export function useAction<A>(factory: ()=>stardust.ActionDefinition<A>, deps?: any[]): A;

/**
 * Gets the desired constraints that should be applied when rendering the visualization.
 * 
 * The constraints are set on the embed configuration before the visualization is rendered
 * and should be respected when implementing the visualization.
 * @deprecated
 */
export function useConstraints(): stardust.Constraints;

/**
 * Gets the desired interaction states that should be applied when rendering the visualization.
 * 
 * The interactions are set on the embed configuration before the visualization is rendered
 * and should be respected when implementing the visualization.
 */
export function useInteractionState(): stardust.Interactions;

/**
 * Gets the options object provided when rendering the visualization.
 * 
 * This is an empty object by default but enables customization of the visualization through this object.
 * Options are different from setting properties on the generic object in that options
 * are only temporary settings applied to the visualization when rendered.
 * 
 * You have the responsibility to provide documentation of the options you support, if any.
 */
export function useOptions(): object;

/**
 * This is an empty object by default, but enables you to provide a custom API of your visualization to
 * make it possible to control after it has been rendered.
 * 
 * You can only use this hook once, calling it more than once is considered an error.
 * @param factory
 * @param deps
 */
export function useImperativeHandle<T>(factory: ()=>T, deps?: any[]): void;

/**
 * Registers a callback that is called when a snapshot is taken.
 * @param snapshotCallback
 */
export function onTakeSnapshot(snapshotCallback: ($: qix.GenericObjectLayout)=>Promise<qix.GenericObjectLayout>): void;

/**
 * Gets render state instance.
 * 
 * Used to update properties and get a new layout without triggering onInitialRender.
 */
export function useRenderState(): stardust.RenderState;

/**
 * Gets an event emitter instance for the visualization.
 */
export function useEmitter(): stardust.Emitter;

/**
 * Gets the desired keyboard settings and status to applied when rendering the visualization.
 * A visualization should in general only have tab stops if either `keyboard.enabled` is false or if active is true.
 * This means that either Nebula isn't configured to handle keyboard input or the chart is currently focused.
 * Enabling or disabling keyboardNavigation are set on the embed configuration and
 * should be respected by the visualization.
 */
export function useKeyboard(): stardust.Keyboard;

/**
 * Provides conversion functionality to extensions.
 */
export namespace Conversion {
    /**
     * Provides conversion functionality to extensions with hyperCubes.
     */
    const hypercube: stardust.hyperCubeConversion;

}

/**
 * Mocks Engima app functionality for demo and testing purposes.
 */
export namespace EnigmaMocker {
    /**
     * Mocks Engima app functionality. It accepts one / many generic objects as input argument and returns the mocked Enigma app. Each generic object represents one visualisation and specifies how it behaves. For example, what layout to use the data to present.
     * 
     * The generic object is represented with a Javascript object with a number of properties. The name of the property correlates to the name in the Enigma model for `app.getObject(id)`. For example, the property `getLayout` in the generic object is used to define `app.getObject(id).getLayout()`. Any property can be added to the fixture (just make sure it exists and behaves as in the Enigma model!).
     * 
     * The value for each property is either fixed (string / boolean / number / object) or a function. Arguments are forwarded to the function to allow for greater flexibility. For example, this can be used to return different hypercube data when scrolling in the chart.
     * @param genericObjects Generic objects controlling behaviour of visualizations.
     * @param options Options
     */
    function fromGenericObjects(genericObjects: object[], options?: stardust.EnigmaMockerOptions): Promise<qix.Doc>;

}

declare namespace stardust {
    interface Component {
        key: string;
    }

    /**
     * Fallback load function for missing types
     */
    type LoadFallback = ($: stardust.LoadType)=>Promise<stardust.Visualization>;

    interface Configuration {
        load?: stardust.LoadFallback;
        context?: stardust.Context;
        types?: stardust.TypeInfo[];
        themes?: stardust.ThemeInfo[];
        hostConfig?: object;
        anything?: object;
    }

    interface Context {
        theme?: string;
        language?: string;
        deviceType?: string;
        constraints?: stardust.Constraints;
        interactions?: stardust.Interactions;
        keyboardNavigation?: boolean;
        disableCellPadding?: boolean;
        dataViewType?: string;
    }

    interface Galaxy {
        translator: stardust.Translator;
        flags: stardust.Flags;
        deviceType: string;
        hostConfig: object;
        anything: object;
    }

    class Embed {
        constructor();

        /**
         * Renders a visualization or sheet into an HTMLElement.
         * Visualizations can either be existing objects or created on the fly.
         * Support for sense sheets is experimental.
         * @param cfg The render configuration.
         */
        render(cfg: stardust.RenderConfig): Promise<stardust.Viz | stardust.Sheet>;

        /**
         * Creates a visualization model
         * @param cfg The create configuration.
         */
        create(cfg: stardust.CreateConfig): Promise<qix.GenericObject>;

        /**
         * Generates properties for a visualization object
         * @param cfg The create configuration.
         */
        generateProperties(cfg: stardust.CreateConfig): Promise<object>;

        /**
         * Updates the current context of this embed instance.
         * Use this when you want to change some part of the current context, like theme.
         * @param ctx The context to update.
         */
        context(ctx: stardust.Context): Promise<undefined>;

        /**
         * Gets the app selections of this instance.
         */
        selections(): Promise<stardust.AppSelections>;

        /**
         * Gets the listbox instance of the specified field
         * @param fieldIdentifier Fieldname as a string, a Library dimension or an object id
         */
        field(fieldIdentifier: string | stardust.LibraryField | stardust.QInfo): Promise<stardust.FieldInstance>;

        /**
         * Gets a list of registered visualization types and versions
         */
        getRegisteredTypes(): Object[];

    }

    type Direction = "ltr" | "rtl";

    type ListLayout = "vertical" | "horizontal";

    type FrequencyMode = "none" | "value" | "percent" | "relative";

    type SearchMode = boolean | "toggle";

    type FieldEventTypes = "selectionActivated" | "selectionDeactivated";

    class FieldInstance {
        constructor();

        /**
         * Event listener function on instance
         * @param eventType event type that function needs to listen
         * @param callback a callback function to run when event emits
         */
        on(eventType: stardust.FieldEventTypes, callback: ()=>void): void;

        /**
         * Remove listener on instance
         * @param eventType event type
         * @param callback handler
         */
        removeListener(eventType: stardust.FieldEventTypes, callback: ()=>void): void;

        /**
         * Mounts the field as a listbox into the provided HTMLElement.
         * @param element
         * @param options Settings for the embedded listbox
         */
        mount(element: HTMLElement, options?: {
            title?: string;
            direction?: stardust.Direction;
            listLayout?: stardust.ListLayout;
            frequencyMode?: stardust.FrequencyMode;
            histogram?: boolean;
            search?: stardust.SearchMode;
            showLock?: boolean;
            toolbar?: boolean;
            checkboxes?: boolean;
            dense?: boolean;
            stateName?: string;
            components?: stardust.Component[];
            properties?: object;
        }): Promise<void>;

        /**
         * Unmounts the field listbox from the DOM.
         */
        unmount(): void;

    }

    type ThemeJSON = any;

    interface ThemeInfo {
        id: string;
        /**
         * A function that should return a Promise that resolves to a raw JSON theme.
         */
        load(): Promise<stardust.ThemeJSON>;
    }

    interface QInfo {
        qId: string;
    }

    /**
     * A controller to further modify a visualization after it has been rendered.
     */
    class Sheet {
        constructor();

        id: string;

        model: string;

        navigation: stardust.Navigation;

        /**
         * Destroys the sheet and removes it from the the DOM.
         */
        destroy(): void;

    }

    /**
     * A controller to further modify a visualization after it has been rendered.
     */
    class Viz {
        constructor();

        id: string;

        model: qix.GenericObject;

        /**
         * Destroys the visualization and removes it from the the DOM.
         */
        destroy(): void;

        /**
         * Converts the visualization to a different registered type.
         * 
         * Will update properties if permissions allow, else will patch (can be forced with forcePatch parameter)
         * 
         * Not all chart types are compatible, similar structures are required.
         * @param newType Which registered type to convert to.
         * @param forceUpdate Whether to apply the change or not, else simply returns the resulting properties, defaults to true.
         * @param forcePatch Whether to always patch the change instead of making a permanent change
         */
        convertTo(newType: string, forceUpdate?: boolean, forcePatch?: boolean): Promise<object>;

        /**
         * Toggles the chart to a data view of the chart.
         * 
         * The chart will be toggled to the type defined in the nebula context (dataViewType).
         * 
         * The default dataViewType for nebula is sn-table. The specified chart type needs to be registered as well, in order to make it possible to render the data view.
         * @param showDataView If included, forces the chart into a specific state. True will show data view, and false will show the original chart. If not included it will always toggle between the two views.
         */
        toggleDataView(showDataView?: boolean): void;

        /**
         * Listens to custom events from inside the visualization. See useEmitter
         * @param eventName Event name to listen to
         * @param listener Callback function to invoke
         */
        addListener(eventName: string, listener: ()=>void): void;

        /**
         * Removes a listener
         * @param eventName Event name to remove from
         * @param listener Callback function to remove
         */
        removeListener(eventName: string, listener: ()=>void): void;

        /**
         * Gets the specific api that a Viz exposes.
         */
        getImperativeHandle(): Promise<object>;

    }

    interface Flags {
        /**
         * Checks whether the specified flag is enabled.
         * @param flag The value flag to check.
         */
        isEnabled(flag: string): boolean;
    }

    class AppSelections {
        constructor();

        /**
         * Mounts the app selection UI into the provided HTMLElement.
         * @param element
         */
        mount(element: HTMLElement): void;

        /**
         * Unmounts the app selection UI from the DOM.
         */
        unmount(): void;

    }

    class ObjectSelections {
        constructor();

        /**
         * Event listener function on instance
         * @param eventType event type that function needs to listen
         * @param callback a callback function to run when event emits
         */
        addListener(eventType: string, callback: ()=>void): void;

        /**
         * Remove listener function on instance
         * @param eventType event type that function needs to listen
         * @param callback a callback function to run when event emits
         */
        removeListener(eventType: string, callback: ()=>void): void;

        /**
         * @param paths
         */
        begin(paths: string[]): Promise<undefined>;

        clear(): Promise<undefined>;

        confirm(): Promise<undefined>;

        cancel(): Promise<undefined>;

        /**
         * @param s
         */
        select(s: {
            method: string;
            params: any[];
        }): Promise<boolean>;

        canClear(): boolean;

        canConfirm(): boolean;

        canCancel(): boolean;

        isActive(): boolean;

        isModal(): boolean;

        /**
         * @param paths
         */
        goModal(paths: string[]): Promise<undefined>;

        /**
         * @param accept
         */
        noModal(accept?: boolean): Promise<undefined>;

    }

    type Field = string | qix.NxDimension | qix.NxMeasure | stardust.LibraryField;

    /**
     * Rendering configuration for creating and rendering a new object
     */
    interface CreateConfig {
        type: string;
        version?: string;
        fields?: stardust.Field[];
        properties?: qix.GenericObjectProperties;
    }

    /**
     * Configuration for rendering a visualisation, either creating or fetching an existing object.
     */
    interface RenderConfig {
        element: HTMLElement;
        options?: object;
        /**
         * Callback function called after rendering successfully
         */
        onRender?(): void;
        /**
         * Callback function called if an error occurs
         * @param $
         */
        onError?($: stardust.RenderError): void;
        plugins?: stardust.Plugin[];
        id?: string;
        type?: string;
        version?: string;
        fields?: stardust.Field[];
        extendProperties?: boolean;
        properties?: qix.GenericObjectProperties;
    }

    interface LibraryField {
        qLibraryId: string;
        type: "dimension" | "measure";
    }

    /**
     * An object literal containing meta information about the plugin and a function containing the plugin implementation.
     */
    interface Plugin {
        info: {
            name: string;
        };
        fn: ()=>void;
    }

    interface LoadType {
        (type: {
            name: string;
            version: string;
        }): Promise<stardust.Visualization>;
    }

    interface TypeInfo {
        name: string;
        version?: string;
        load: stardust.LoadType;
        meta?: object;
    }

    class RenderError extends Error {
        constructor(message: string, originalError: Error);

        originalError: Error;

    }

    class Navigation implements stardust.Emitter {
        constructor();

        /**
         * Navigate to the supplied sheet and emit 'sheetChanged' event if the target sheet Id is valid.
         * This allows a navigation object to synchronize its current sheet item with the active sheet.
         * @param sheetId Id of the sheet to navigate to
         */
        goToSheet(sheetId: string): void;

        /**
         * Return the current sheet id
         */
        getCurrentSheetId(): string | "false";

    }

    interface ActionToolbarElement extends HTMLElement{
        className: "njs-action-toolbar-popover";
    }

    interface ActionElement extends HTMLElement{
        className: "njs-cell-action";
    }

    interface CellElement extends HTMLElement{
        className: "njs-cell";
    }

    interface CellFooter extends HTMLElement{
        className: "njs-cell-footer";
    }

    interface CellTitle extends HTMLElement{
        className: "njs-cell-title";
    }

    interface CellSubTitle extends HTMLElement{
        className: "njs-cell-sub-title";
    }

    interface SheetElement extends HTMLElement{
        className: "njs-sheet";
    }

    interface VizElementAttributes extends NamedNodeMap{
        "data-render-count": string;
    }

    interface VizElement extends HTMLElement{
        attributes: stardust.VizElementAttributes;
        className: "njs-viz";
    }

    /**
     * The entry point for defining a visualization.
     */
    interface Visualization {
        (galaxy: stardust.Galaxy): stardust.VisualizationDefinition;
    }

    interface VisualizationDefinition {
        qae: stardust.QAEDefinition;
        component(): void;
    }

    interface SetStateFn<S> {
        (newState: S | (($: S)=>S)): void;
    }

    /**
     * Callback function that should return a function that in turns gets
     * called before the hook runs again or when the component is destroyed.
     * For example to remove any listeners added in the callback itself.
     */
    type EffectCallback = ()=>void | (()=>void);

    /**
     * Reference object returned from useRef
     */
    interface Ref<R> {
        current: R;
    }

    interface Rect {
        top: number;
        left: number;
        width: number;
        height: number;
    }

    interface ActionDefinition<A> {
        action: A;
        hidden?: boolean;
        disabled?: boolean;
        icon?: {
            viewBox?: string;
            shapes: {
            }[];
        };
    }

    /**
     * @deprecated
     */
    interface Constraints {
        passive?: boolean;
        active?: boolean;
        select?: boolean;
        edit?: boolean;
    }

    interface Interactions {
        passive?: boolean;
        active?: boolean;
        select?: boolean;
        edit?: boolean;
    }

    interface RenderState {
        pending: any;
        restore: any;
    }

    class Emitter {
        constructor();

    }

    interface Keyboard {
        enabled: boolean;
        active: boolean;
        /**
         * Function used by the visualization to tell Nebula it wants to relinquish focus
         * @param $
         */
        blur?($: boolean): void;
        /**
         * Function used by the visualization to tell Nebula it wants to focus
         */
        focus?(): void;
        /**
         * Function used by the visualization to tell Nebula that focus the selection toolbar
         * @param $
         */
        focusSelection?($: boolean): void;
    }

    /**
     * Imports properties for a chart with a hypercube.
     */
    type importProperties = (args: {
        exportFormat: stardust.ExportFormat;
        initialProperties?: Object;
        dataDefinition?: Object;
        defaultPropertyValues?: Object;
        hypercubePath: string;
    })=>Object;

    /**
     * Exports properties for a chart with a hypercube.
     */
    type exportProperties = (args: {
        propertyTree: Object;
        hypercubePath: string;
    })=>stardust.ExportFormat;

    interface QAEDefinition {
        properties?: qix.GenericObjectProperties;
        data?: {
            targets: stardust.DataTarget[];
        };
        importProperties?: stardust.importProperties;
        exportProperties?: stardust.exportProperties;
    }

    interface DataTarget {
        path: string;
        dimensions?: stardust.FieldTarget<qix.NxDimension>;
        measures?: stardust.FieldTarget<qix.NxMeasure>;
    }

    type fieldTargetAddedCallback<T> = (field: T, properties: qix.GenericObjectProperties)=>void;

    type fieldTargetRemovedCallback<T> = (field: T, properties: qix.GenericObjectProperties, index: number)=>void;

    interface FieldTarget<T> {
        min?: (()=>void) | number;
        max?: (()=>void) | number;
        added?: stardust.fieldTargetAddedCallback<T>;
        removed?: stardust.fieldTargetRemovedCallback<T>;
    }

    class Translator {
        constructor();

        /**
         * Returns current locale.
         * @param lang language Locale to updated the currentLocale value
         */
        language(lang?: string): string;

        /**
         * Registers a string in multiple locales
         * @param item
         */
        add(item: {
            id: string;
            locale: object;
        }): void;

        /**
         * Translates a string for current locale.
         * @param str ID of the registered string.
         * @param args Values passed down for string interpolation.
         */
        get(str: string, args?: string[]): string;

    }

    class Theme {
        constructor();

        /**
         * Returns theme name
         */
        name(): string;

        getDataColorScales(): stardust.Theme.ScalePalette[];

        getDataColorPalettes(): stardust.Theme.DataPalette[];

        getDataColorPickerPalettes(): stardust.Theme.ColorPickerPalette[];

        getDataColorSpecials(): stardust.Theme.DataColorSpecials;

        /**
         * Resolve a color object using the color picker palette from the provided JSON theme.
         * @param c
         * @param supportNone Shifts the palette index by one to account for the "none" color
         */
        getColorPickerColor(c: {
            index?: number;
            color?: string;
        }, supportNone?: boolean): string;

        /**
         * Get the best contrasting color against the specified `color`.
         * This is typically used to find a suitable text color for a label placed on an arbitrarily colored background.
         * 
         * The returned colors are derived from the theme.
         * @param color A color to measure the contrast against
         */
        getContrastingColorTo(color: string): string;

        /**
         * Get the value of a style attribute in the theme
         * by searching in the theme's JSON structure.
         * The search starts at the specified base path
         * and continues upwards until the value is found.
         * If possible it will get the attribute's value using the given path.
         * When attributes separated by dots are provided, such as 'hover.color',
         * they are required in the theme JSON file
         * @param basePath Base path in the theme's JSON structure to start the search in (specified as a name path separated by dots).
         * @param path Expected path for the attribute (specified as a name path separated by dots).
         * @param attribute Name of the style attribute. (specified as a name attribute separated by dots).
         */
        getStyle(basePath: string, path: string, attribute: string): string | undefined;

    }

    namespace Theme {
        interface ScalePalette {
            key: string;
            type: "gradient" | "class-pyramid";
            colors: string[] | (string[])[];
        }

        interface DataPalette {
            key: string;
            type: "pyramid" | "row";
            colors: string[] | (string[])[];
        }

        interface ColorPickerPalette {
            key: string;
            colors: string[];
        }

        interface DataColorSpecials {
            primary: string;
            nil: string;
            others: string;
        }

    }

    /**
     * Used for exporting and importing properties between backend models. An object that exports to
     * ExportFormat should put dimensions and measures inside one data group. If an object has two hypercubes,
     * each of the cubes should export dimensions and measures in two separate data groups.
     * An object that imports from this structure is responsible for putting the existing properties where they should be
     * in the new model.
     */
    interface ExportFormat {
        data?: stardust.ExportDataDef[];
        properties?: object;
    }

    interface ExportDataDef {
        dimensions: qix.NxDimension[];
        measures: qix.NxMeasure[];
        excludedDimensions: qix.NxDimension[];
        excludedMeasures: qix.NxMeasure[];
        interColumnSortOrder: number[];
    }

    interface ConversionType {
        importProperties: stardust.importProperties;
        exportProperties: stardust.exportProperties;
    }

    interface hyperCubeConversion {
    }

    /**
     * Options for Enigma Mocker
     */
    interface EnigmaMockerOptions {
        delay: number;
    }

}

