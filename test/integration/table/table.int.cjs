const path = require('path');
const serve = require('@nebula.js/cli-serve'); // eslint-disable-line
const puppeteerUtil = require('../../utils/puppeteer-util');

describe('Table visualization', () => {
  const content = '.simple-table';
  let s;

  before(async () => {
    s = await serve({
      entry: path.resolve(__dirname, 'sn-table'),
      open: false,
      fixturePath: 'test/integration/table',
    });
    puppeteerUtil.addListeners(page);
  });

  after(() => {
    s.close();
    puppeteerUtil.removeListeners(page);
  });

  describe('basic', () => {
    before(async () => {
      const url = `${s.url}/render?fixture=table.fix.js`;
      await page.goto(url);

      await page.waitForSelector(content, { visible: true });
    });

    it('should render a div', async () => {
      const text = await page.$eval('.hello', (el) => el.textContent);
      expect(text).to.equal('A simple table');
    });

    it('should be able to load json file', async () => {
      const text = await page.$eval('.json-value', (el) => el.textContent);
      expect(text).to.equal('Hi json!');
    });

    it('should be able to load css', async () => {
      const bg = await page.$eval('.hello', (el) => window.getComputedStyle(el).backgroundColor);
      expect(bg).to.equal('rgb(144, 41, 140)');
    });

    it('should have some data', async () => {
      const text = await page.$eval('.table table tbody td', (el) => el.textContent);
      expect(text).to.equal('A');
    });
  });
});
