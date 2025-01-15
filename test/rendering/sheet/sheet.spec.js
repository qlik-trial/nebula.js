import { test, expect } from '@playwright/test';
import getPage from '../setup';
import startServer from '../server';

test.describe('sheet mashup rendering test', () => {
  const object = '[data-type="sheet"]';
  let page;
  let destroyServer;
  let destroyBrowser;

  let url;
  const PAGE_OPTIONS = { width: 600, height: 500 };

  test.beforeEach(async () => {
    ({ url, destroy: destroyServer } = await startServer(8051));
    ({ page, destroy: destroyBrowser } = await getPage(PAGE_OPTIONS));
  });

  test.afterEach(async () => {
    await Promise.all([destroyServer(), destroyBrowser()]);
  });

  test('sheet basic test', async () => {
    const FILE_NAME = 'sheet_basic.png';

    await page.goto(`${url}/sheet/sheet.html?target=sheet`);
    const selector = await page.waitForSelector(object, { visible: true });
    const image = await selector.screenshot();
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test('sheet bound Less test', async () => {
    const FILE_NAME = 'sheet_bound_less.png';

    await page.goto(`${url}/sheet/sheet.html?target=boundLessSheet`);
    const selector = await page.waitForSelector(object, { visible: true });
    const image = await selector.screenshot();
    return expect(image).toMatchSnapshot(FILE_NAME);
  });
});
