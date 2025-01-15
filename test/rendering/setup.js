import { chromium } from '@playwright/test';

export default async function getPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);
  page.setDefaultTimeout(30000);

  const destroy = async () => {
    await browser.close();
  };

  return { browser, page, destroy };
}
