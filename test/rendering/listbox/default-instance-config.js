import themeTarallo from './themes/theme-tarallo.json';

export default {
  context: {
    language: 'sv-SE',
    theme: 'senseish',
  },
  themes: [
    {
      id: 'senseish',
      theme: { fontFamily: 'Arial' },
    },
    {
      id: 'theme-tarallo',
      theme: themeTarallo,
    },
  ],
};
