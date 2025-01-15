/* eslint-disable no-undef */
import { test, expect } from '@playwright/test';
import getPage from '../setup';
import startServer from '../server';

test.describe('keyboard navigation', () => {
  const filePrefix = 'listbox-focus';
  const object = '[data-type="listbox"]';
  const listboxSelector = `${object} .listbox-container`;
  const confirmButtonSelector = '[data-testid="actions-toolbar-confirm"]';
  let page;

  let destroyServer;
  let destroyBrowser;
  let url;

  test.use({ viewport: { width: 300, height: 500 } });

  test.beforeEach(async () => {
    ({ url, destroy: destroyServer } = await startServer(8050));
    ({ page, destroy: destroyBrowser } = await getPage());
  });

  test.afterEach(async () => {
    await Promise.all([destroyServer(), destroyBrowser()]);
  });

  test('hovering and pressing arrow down should scroll listbox', async () => {
    const FILE_NAME = 'listbox_key_scroll.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`, { waitUntil: 'networkidle' });
    const selector = await page.waitForSelector(listboxSelector, { visible: true });

    await page.hover(listboxSelector);
    await page.press(listboxSelector, 'ArrowDown');

    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test('simple list move down up and select C', async () => {
    await page.goto(`${url}/listbox/listbox.html?scenario=standard`, { waitUntil: 'networkidle' });
    const selector = await page.waitForSelector(listboxSelector, { visible: true });

    // Move focus from A to C.
    const firstRow = await page.waitForSelector('[data-testid="listbox.item"]:first-child .value');
    await firstRow.focus();
    await page.keyboard.press('ArrowDown'); // At B
    await page.keyboard.press('ArrowDown'); // At C
    const focusCImage = await selector.screenshot({ caret: 'hide' });
    expect(focusCImage).toMatchSnapshot(`${filePrefix}-C.png`);

    // Select and move focus up one step.
    await page.keyboard.press('Space'); // Select C
    await page.keyboard.press('ArrowUp'); // At B
    const focusBAndSelectedCImage = await selector.screenshot({ caret: 'hide' });
    expect(focusBAndSelectedCImage).toMatchSnapshot(`${filePrefix}-B-select-C.png`);

    // Tab to confirm button.
    await page.keyboard.press('Tab'); // At confirm button
    const focusConfirm = await selector.screenshot({ caret: 'hide' });
    expect(focusConfirm).toMatchSnapshot(`${filePrefix}-confirm.png`);

    // Tab into search field.
    await page.keyboard.press('Tab'); // At confirm button
    const focusSearch = await selector.screenshot({ caret: 'hide' });
    expect(focusSearch).toMatchSnapshot(`${filePrefix}-search.png`);

    // Tab back into last focused row.
    await page.keyboard.press('Tab'); // At a row again
    const focusRow = await selector.screenshot({ caret: 'hide' });
    expect(focusRow).toMatchSnapshot(`${filePrefix}-row-again.png`);

    // Press Enter to confirm selections.
    await page.keyboard.press('Enter');
    const stillFocusingRow = await selector.screenshot({ caret: 'hide' });
    expect(stillFocusingRow).toMatchSnapshot(`${filePrefix}-row-after-confirm.png`);
  });

  test('grid mode with column view and navigating in all directions with arrow keys and select "Baked goods".', async () => {
    await page.goto(`${url}/listbox/listbox.html?fixture=./__fixtures__/multi_scenario_grid_column_7.js`, {
      waitUntil: 'networkidle',
    });
    const selector = await page.waitForSelector(listboxSelector, { visible: true });

    // Tab into search field.
    await page.keyboard.press('Tab');

    // Tab into first cell.
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Space');
    await page.keyboard.press('Enter');
    const listbox = await selector.screenshot({ caret: 'hide' });
    expect(listbox).toMatchSnapshot(`${filePrefix}-grid-row-select-baked-goods.png`);
  });

  test('(keyboardNavigation = false) grid mode with cyclic dimension and tabbing between components inside listbox', async () => {
    // keyboardNavigation = false means the tabbing order relies on tabindex
    await page.goto(`${url}/listbox/listbox.html?fixture=./__fixtures__/cyclic.js&keyboardNavigation=false`, {
      waitUntil: 'networkidle',
    });
    await page.waitForSelector(listboxSelector, { visible: true });
    const cyclicButton = await page.getByTestId('listbox-cyclic-button');
    const searchInput = await page.getByTestId('search-input-field');
    const firstRow = await page.getByRole('row').nth(0);

    // Tab into cyclic button
    await page.keyboard.press('Tab');
    await expect.soft(cyclicButton).toBeFocused();

    // Tab to search
    await page.keyboard.press('Tab');
    await expect.soft(searchInput).toBeFocused();

    // Tab into first row
    await page.keyboard.press('Tab');
    await expect.soft(firstRow).toBeFocused();

    // Make selection
    await page.keyboard.press('Space');
    await page.waitForSelector(confirmButtonSelector, { visible: true });

    // Tab to confirm button
    await page.keyboard.press('Tab');
    const confirmButton = page.getByTestId('actions-toolbar-confirm');
    await expect.soft(confirmButton).toBeFocused();

    // Tab to search
    await page.keyboard.press('Tab');
    await expect.soft(searchInput).toBeFocused();
  });

  test('(keyboardNavigation = true) grid mode with cyclic dimension and tabbing between components inside listbox', async () => {
    await page.goto(`${url}/listbox/listbox.html?fixture=./__fixtures__/cyclic.js&keyboardNavigation=true`, {
      waitUntil: 'networkidle',
    });
    const selector = await page.waitForSelector(listboxSelector, { visible: true });
    const cyclicButton = await page.getByTestId('listbox-cyclic-button');
    const searchInput = await page.getByTestId('search-input-field');
    const firstRow = await page.getByRole('row').nth(0);
    await selector.focus();

    // Activate keyboard nav inside listbox
    await page.keyboard.press('Space');
    await expect.soft(cyclicButton).toBeFocused();

    // Tab to search
    await page.keyboard.press('Tab');
    await expect.soft(searchInput).toBeFocused();

    // Tab into first row
    await page.keyboard.press('Tab');
    await expect.soft(firstRow).toBeFocused();

    // Make selection
    await page.keyboard.press('Space');
    await page.waitForSelector(confirmButtonSelector, { visible: true });

    // Tab to confirm button
    await page.keyboard.press('Tab');
    const confirmButton = page.getByTestId('actions-toolbar-confirm');
    await expect.soft(confirmButton).toBeFocused();

    // Tab to cyclic button from confirm button
    await page.keyboard.press('Tab');
    await expect.soft(cyclicButton).toBeFocused();
  });
});
