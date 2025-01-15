const vars = require('../apis/locale/all');

const languages = [
  'en-US',
  'it-IT',
  'zh-CN',
  'zh-TW',
  'ko-KR',
  'de-DE',
  'sv-SE',
  'es-ES',
  'pt-BR',
  'ja-JP',
  'fr-FR',
  'nl-NL',
  'tr-TR',
  'pl-PL',
  'ru-RU',
];

Object.keys(vars).forEach((key) => {
  const supportLanguagesForString = Object.keys(vars[key].locale);
  if (supportLanguagesForString.indexOf('en-US') === -1) {
    // en-US must exist
    throw new Error(`String '${vars[key].id}' is missing value for 'en-US'`);
  }
  for (let i = 0; i < languages.length; i++) {
    if (supportLanguagesForString.indexOf(languages[i]) === -1) {
      console.warn(`String '${vars[key].id}' is missing value for '${languages[i]}'`);
    }
  }
});
