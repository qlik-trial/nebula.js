describe('listbox', () => {
  const awaitText = async (selector, text, options = { timeout: 10000 }) => {
    await page.waitForSelector(selector, { visible: true });
    await page.waitForFunction(
      (s, t) => document.querySelector(s) && document.querySelector(s).innerText.includes(t),
      options,
      `${selector}`,
      text
    );
  };
  const listboxSelector = `.listbox-container`;

  function getScenarioUrl(scenario) {
    return `${process.env.BASE_URL}/listbox/listbox.html?scenario=${scenario}`;
  }

  it('should resolve mount promise after data is fetched', async () => {
    const url = getScenarioUrl('scenario1');
    await page.goto(url);

    await page.waitForSelector(listboxSelector, { visible: true });
    await page.waitForSelector('#flow-tracker', { visible: true });
    await awaitText('#flow-tracker', 'mount promise resolved');

    // eslint-disable-next-line no-promise-executor-return
    await new Promise((r) => setTimeout(r, 2000));
    const innerText = await page.$eval('#flow-tracker', (el) => el.innerText);
    expect(innerText.includes('getLayout')).equal(true);
    expect(innerText.includes('getListObjectData')).equal(true);

    const actions = innerText.slice(0, -1).split(',');
    const lastAction = actions.pop();
    expect(lastAction).equal('mount promise resolved');
  });
});
