const pie = {
  component: {
    mounted(el) {
      el.innerHTML = 'Hello pie'; // eslint-disable-line
    },
  },
};

const bar = function (env) {
  env.translator.add({
    id: 'hello',
    locale: {
      'sv-SE': 'Hej {0}!',
    },
  });
  return {
    component: {
      mounted(el) {
        el.innerHTML = `<div style="font-size: 64px;">${env.translator.get('hello', ['bar'])}</div>`; // eslint-disable-line
      },
    },
  };
};

// eslint-disable-next-line
const configured = stardust.embed.createConfiguration({
  context: {
    theme: 'dark',
    language: 'sv-SE',
  },
  types: [
    {
      name: 'pie',
      load: () => Promise.resolve(pie),
    },
    {
      name: 'bar',
      load: () => Promise.resolve(bar),
    },
  ],
});
