const serve = require('@nebula.js/cli-serve'); // eslint-disable-line
const puppeteerUtil = require('../../utils/puppeteer-util');

describe('sn', () => {
  const snSelector = '.njs-viz';
  const errorSelector = '.njs-cell [data-tid="error-title"]';
  let s;

  before(async () => {
    s = await serve({
      open: false,
      build: false,
      fixturePath: 'test/component/object',
    });
    puppeteerUtil.addListeners(page);
  });

  after(() => {
    s.close();
    puppeteerUtil.removeListeners(page);
  });

  it('should render with translation', async () => {
    await page.goto(`${s.url}/render?fixture=sn-locale.fix.js&language=sv-SE`);

    await page.waitForSelector(snSelector, { visible: true });
    const text = await page.$eval(snSelector, (el) => el.textContent);
    expect(text).to.equal('Hej motor!');
  });

  it('should show incomplete visualization', async () => {
    await page.goto(`${s.url}/render?fixture=sn-incomplete.fix.js&theme=dark`);

    await page.waitForSelector(errorSelector, { visible: true });
    const text = await page.$eval(errorSelector, (el) => el.textContent);
    expect(text).to.equal('Incomplete visualization');
  });

  it('should show error caused during load', async () => {
    await page.goto(`${s.url}/render?fixture=sn-error.fix.js`);

    await page.waitForSelector(errorSelector, { visible: true });
    const text = await page.$eval(errorSelector, (el) => el.textContent);
    expect(text).to.equal('hahaha');
  });
});
