/* eslint-disable jest/valid-expect */
const path = require('path');
const serve = require('@nebula.js/cli-serve'); // eslint-disable-line
const puppeteerUtil = require('../../utils/puppeteer-util');

describe('hooks', () => {
  const snSelector = '.njs-viz';
  let s;

  before(async () => {
    s = await serve({
      entry: path.resolve(__dirname, 'sn-hooks'),
      open: false,
      build: true,
      fixturePath: 'test/component/hooks',
    });
    puppeteerUtil.addListeners(page);

    const url = `${s.url}/render?fixture=hooked.fix.js`;
    await page.goto(url);
    await page.waitForSelector(snSelector, { visible: true });
  });

  after(() => {
    s.close();
    puppeteerUtil.removeListeners(page);
  });

  it('usePromise', async () => {
    await page.waitForFunction(
      (selector) => document.querySelector(selector).getAttribute('data-render-count') === '1',
      {},
      `${snSelector}`
    );
    expect(await page.$eval(`${snSelector} .promise`, (el) => el.textContent)).to.equal('ready!');
  });

  it('should render with initial state', async () => {
    const state = await page.$eval(`${snSelector} .state`, (el) => el.textContent);
    expect(state).to.equal('0');
    const action = await page.$eval(`${snSelector} .action`, (el) => el.textContent);
    expect(action).to.equal('false');
  });

  it('should update count state after first click', async () => {
    await page.click(snSelector);
    await page.waitForFunction(
      (selector) => document.querySelector(selector).textContent === '1',
      {},
      `${snSelector} .state`
    );
    const text = await page.$eval(`${snSelector} .state`, (el) => el.textContent);
    expect(text).to.equal('1');
  });

  it('should update action state after second click', async () => {
    await page.click(snSelector);
    await page.waitForFunction(
      (selector) => document.querySelector(selector).textContent === 'true',
      {},
      `${snSelector} .action`
    );
    const text = await page.$eval(`${snSelector} .action`, (el) => el.textContent);
    expect(text).to.equal('true');
  });

  it('useLayout', async () => {
    const text = await page.$eval(`${snSelector} .layout`, (el) => el.textContent);
    expect(text).to.equal('true');
  });

  it('useAppLayout', async () => {
    const text = await page.$eval(`${snSelector} .applayout`, (el) => el.textContent);
    expect(text).to.equal('app-layout');
  });

  it('useTranslator', async () => {
    const text = await page.$eval(`${snSelector} .translator`, (el) => el.textContent);
    expect(text).to.equal('Cancel');
  });

  it('useDeviceType', async () => {
    const text = await page.$eval(`${snSelector} .deviceType`, (el) => el.textContent);
    expect(text).to.equal('desktop');
  });

  it('useTheme', async () => {
    const text = await page.$eval(`${snSelector} .theme`, (el) => el.textContent);
    expect(text).to.equal('#a54343');
  });

  it('useConstraints', async () => {
    const text = await page.$eval(`${snSelector} .constraints`, (el) => el.textContent);
    expect(text).to.equal('false:false:false');
  });

  it('useOptions', async () => {
    const text = await page.$eval(`${snSelector} .options`, (el) => el.textContent);
    expect(text).to.equal('opts');
  });

  it('useEmbed', async () => {
    const text = await page.$eval(`${snSelector} .embed`, (el) => el.textContent);
    expect(text).to.equal('function'); // typeof embed.render
  });

  it('useEmitter', async () => {
    const text = await page.$eval(`#events`, (el) => el.textContent);
    expect(text).to.equal('A message from the Chart');
  });

  it('should have true MAGIC_FLAG', async () => {
    const text = await page.$eval(`${snSelector} .flags`, (el) => el.textContent);
    expect(text).to.equal('true:false');
  });
});
