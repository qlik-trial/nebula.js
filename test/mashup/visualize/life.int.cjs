describe('object lifecycle', () => {
  const waitForTextStatus = async (selector, text, options = { timeout: 1000 }) => {
    await page.waitForSelector(selector, { visible: true });
    await page.waitForFunction(
      (s, t) => document.querySelector(s) && document.querySelector(s).textContent === t,
      options,
      `${selector}`,
      text
    );
  };

  function getScenarioUrl(scenario) {
    return `${process.env.BASE_URL}/visualize/life.html?scenario=${scenario}`;
  }

  it('should fail to load unknown type', async () => {
    const url = getScenarioUrl('invalid-type');
    await page.goto(url);
    await waitForTextStatus(
      '[data-tid="error-title"]',
      "Could not find a version of 'voooz' that supports current object version. Did you forget to register voooz?"
    );
    await waitForTextStatus(
      '[data-tid="error-external"]',
      "Could not find a version of 'voooz' that supports current object version. Did you forget to register voooz?"
    );
  });

  it('should show spinner and requirements for known type', async () => {
    const url = getScenarioUrl('valid-type');
    await page.goto(url);

    // should show loading spinner
    await page.waitForSelector('.njs-cell [role="progressbar"]', { timeout: 3000 });

    await waitForTextStatus('[data-tid="error-title"]', 'Incomplete visualization');
  });

  it('should render long running query', async () => {
    const url = getScenarioUrl('long-running');
    await page.goto(url);
    await waitForTextStatus('[data-tid="update-active"]', 'Updating data');

    // the cancel button should appear after 2000ms
    await page.click('.njs-cell button');
    await waitForTextStatus('[data-tid="update-cancelled"]', 'Data update was cancelled');
    // Retry
    await waitForTextStatus('.njs-cell button', 'Retry');
    await page.click('.njs-cell button');

    await waitForTextStatus('.rendered', 'Success!', { timeout: 7000 });
  });

  // need to fix calc condition view first
  it('should show calculation unfulfilled', async () => {
    const url = getScenarioUrl('calc-unfulfilled');
    await page.goto(url);
    await waitForTextStatus('[data-tid="error-title"]', 'The calculation condition is not fulfilled');
  });

  it('should render error when a hypercube contains a qError', async () => {
    const url = getScenarioUrl('hypercube-error');
    await page.goto(url);
    await waitForTextStatus('[data-tid="error-title"]', 'Error');
  });

  it('should render when requirements are fulfilled', async () => {
    const url = getScenarioUrl('valid-config');
    await page.goto(url);
    await waitForTextStatus('.rendered', 'Success!');
  });

  it('should destroy', async () => {
    const url = getScenarioUrl('destroy');
    await page.goto(url);
    // wait for some time to ensure destroy has been run and no errors are thrown
    await page.waitFor(5000);
  });
});
