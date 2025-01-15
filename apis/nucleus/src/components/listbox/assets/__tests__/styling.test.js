import getStyling, { DEFAULT_SELECTION_COLORS, getOverridesAsObject } from '../styling';

describe('styling', () => {
  let theme = {};
  let components = [];
  let themeApi;
  const app = {
    session: {
      config: {
        url: 'wss://hey-hey/images',
      },
    },
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    themeApi = {
      getStyle: (ns, path, prop) => `${ns},${path},${prop}`,
      validateColor: (color) => color,
      getColorPickerColor: (color) => color?.color,
    };
    theme = {
      listBox: {
        title: {
          main: {
            color: 'red',
            fontSize: 24,
          },
        },
        content: {
          color: 'red',
          fontSize: 24,
        },
      },
      palette: {
        divider: '#ccc',
        custom: {
          focusBorder: 'blue',
        },
        text: {
          primary: 'primary',
        },
        selected: {
          main: 'selected-from-theme',
          alternative: 'alternative-from-theme',
          excluded: 'excluded-from-theme',
          selectedExcluded: 'selected-excluded-from-theme',
          possible: 'possible-from-theme',
        },
        primary: {
          main: '#main-color',
        },
        background: {
          default: 'default-background',
        },
      },
    };
  });

  describe('should return expected header style based on theme and then overridden by components', () => {
    describe('background', () => {
      beforeEach(() => {
        components = [
          {
            key: 'theme',
            background: {
              colorExpression: '="some expression"',
              useExpression: true,
              color: {
                color: '#hex-color',
                index: -1,
              },
            },
          },
        ];
      });
      it('background color expression should be used', () => {
        const styles = getStyling({ app, themeApi, theme, components });
        expect(styles.background.backgroundColor).toEqual('="some expression"');
      });
      it('background color expression should NOT be used, but instead color picker color', () => {
        components[0].background.useExpression = false;
        const styles = getStyling({ app, themeApi, theme, components });
        expect(styles.background.backgroundColor).toEqual('#hex-color');
      });
      it('background image should be exposed', () => {
        components[0].background.image = {
          mode: 'media',
          mediaUrl: { qStaticContentUrl: { qUrl: 'some-image.png' } },
          qStaticContentUrl: {},
          sizing: 'stretchFit',
        };
        const styles = getStyling({ app, themeApi, theme, components });
        expect(styles.background.backgroundImage).toEqual("url('https://hey-heysome-image.png')");
        expect(styles.background.backgroundRepeat).toEqual('no-repeat');
        expect(styles.background.backgroundSize).toEqual('100% 100%');
        expect(styles.background.backgroundPosition).toEqual('center center');
      });
    });

    it('search - should get its color from theme style', () => {
      const styles = getStyling({ app, themeApi, theme, components: [] });
      expect(styles.search.color).toEqual('object.listBox,content,color');
    });
    it('search - should get desired color if contrasting enough', () => {
      themeApi.getStyle = () => '#888888';
      const styles = getStyling({ app, themeApi, theme, components: [] });
      expect(styles.search.color).toEqual('#888888');
    });
    it('search - should get a better contrasting color if not good contrast against white', () => {
      themeApi.getStyle = () => '#aaa';
      const styles = getStyling({ app, themeApi, theme, components: [] });
      expect(styles.search.color).toEqual('#000000');
    });
    it('header', () => {
      components = [
        {
          key: 'theme',
          header: {
            fontSize: 'size-from-component',
            fontColor: {
              color: 'color-from-component',
            },
          },
        },
      ];
      let inst;
      let header;
      inst = getStyling({ app, themeApi, theme, components: [] });
      header = inst.header;
      expect(header.fontSize).toEqual('object.listBox,title.main,fontSize');
      expect(header.color).toEqual('object.listBox,title.main,color');

      inst = getStyling({ app, themeApi, theme, components });
      header = inst.header;
      expect(header.fontSize).toEqual('size-from-component');
      expect(header.color).toEqual('color-from-component');
    });

    it('content - should override text color with a contrasting color since we have specified a text color and useContrastColor is true', () => {
      components = [
        {
          key: 'theme',
          content: {
            fontSize: 'size-from-component',
            fontColor: {
              index: -1,
              color: undefined, // <- should not trigger a contrast color
            },
            useContrastColor: true,
          },
        },
      ];
      const POSSIBLE_COLOR = 'rgb(255, 255, 255)';
      const CONTRASTING_TO_POSSIBLE = '#000000';

      themeApi.getStyle = (ns, path, prop) => (prop.includes('possible') ? POSSIBLE_COLOR : `${ns},${path},${prop}`);
      components[0].content.fontColor.color = '#FFFFFF';
      const styles2 = getStyling({ app, themeApi, theme, components });
      expect(styles2.content.color).toEqual(CONTRASTING_TO_POSSIBLE);
    });

    it('content - should override with component properties', () => {
      components = [
        {
          key: 'theme',
          content: {
            fontSize: 'size-from-component',
            fontColor: {
              index: -1,
              color: 'color-from-component',
            },
            useContrastColor: false,
          },
        },
      ];
      const styles = getStyling({ app, themeApi, theme, components });
      const { content } = styles;
      expect(content.fontSize).toEqual('size-from-component');
      expect(content.color).toEqual('color-from-component');
    });

    it('using not supported or empty components should throw error', () => {
      const inputComponents = ['general', 'selections', 'theme', 'not-supported', undefined].map((key) => ({ key }));
      expect(inputComponents).toHaveLength(5);
      expect(Object.keys(getOverridesAsObject(inputComponents)).sort()).toEqual(['selections', 'theme']);
    });
  });

  describe('getSelectionColors', () => {
    let themeSelectionColorsEnabled;

    beforeEach(() => {
      components = [];
      themeSelectionColorsEnabled = true;
      themeApi.getStyle = () => undefined;
    });

    const getStylingCaller = () =>
      getStyling({ app, themeApi, theme, components, themeSelectionColorsEnabled }).selections;

    it('should return selection colors from components', () => {
      components = [
        {
          key: 'selections',
          colors: {
            selected: {
              color: 'selected-from-component',
            },
            alternative: {
              color: 'alternative-from-component',
            },
            excluded: {
              color: 'excluded-from-component',
            },
            selectedExcluded: {
              color: 'selectedExcluded-from-component',
            },
            possible: {
              color: 'possible-from-component',
            },
          },
        },
      ];

      expect(getStylingCaller()).toMatchObject({
        selected: 'selected-from-component',
        alternative: 'alternative-from-component',
        excluded: 'excluded-from-component',
        selectedExcluded: 'selectedExcluded-from-component',
        possible: 'possible-from-component',
      });
    });

    it('should return selection colors from themeAPI', () => {
      themeApi.getStyle = (ns, path, prop) => `${ns},${path},${prop}`;

      expect(getStylingCaller()).toMatchObject({
        selected: 'object.listBox,,dataColors.selected',
        alternative: 'object.listBox,,dataColors.alternative',
        excluded: 'object.listBox,,dataColors.excluded',
        selectedExcluded: 'object.listBox,,dataColors.selectedExcluded',
        possible: 'object.listBox,,dataColors.possible',
      });
    });
    it('should return selection colors from mui theme, except possible which returns background color', () => {
      themeApi.getStyle = (ns, path, prop) => (prop === 'backgroundColor' ? `${ns},${path},${prop}` : undefined);

      expect(getStylingCaller()).toMatchObject({
        selected: 'selected-from-theme',
        alternative: 'alternative-from-theme',
        excluded: 'excluded-from-theme',
        selectedExcluded: 'selected-excluded-from-theme',
        possible: 'object.listBox,,backgroundColor',
      });
    });

    it('should return selection colors from mui theme, for all states', () => {
      expect(getStylingCaller()).toMatchObject({
        selected: 'selected-from-theme',
        alternative: 'alternative-from-theme',
        excluded: 'excluded-from-theme',
        selectedExcluded: 'selected-excluded-from-theme',
        possible: 'possible-from-theme',
      });
    });

    it('should return selection colors from hardcoded default', () => {
      theme.palette.selected = {};

      expect(getStylingCaller()).toMatchObject(DEFAULT_SELECTION_COLORS);
    });
  });
});
