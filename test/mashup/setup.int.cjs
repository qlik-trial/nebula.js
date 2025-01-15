const puppeteerUtil = require('../utils/puppeteer-util');
const server = require('./server');

if (!process.env.BASE_URL) {
  let s;
  before(async () => {
    s = await server();
    process.env.BASE_URL = s.url;
    puppeteerUtil.addListeners(page);
  });

  after(async () => {
    await s.close();
    puppeteerUtil.removeListeners(page);
  });
}
