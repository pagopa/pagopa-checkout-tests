import {checkCookieBanner, showCookiesPreferences } from './utils/helpers.js';

describe('checkout tests', () => {
  /**
   * Test input and configuration
   */
  const IO_PAY_PORTAL_URL = "https://uat.checkout.pagopa.it/";

  /**
   * Increase default test timeout (5000ms)
   * to support entire payment flow
   */
  jest.setTimeout(30000);

  beforeEach(async () => {
    await page.goto(IO_PAY_PORTAL_URL);
    await page.setViewport({ width: 1200, height: 907 });    
  });

  it('OneTrust cookie spolicy banner should be visible', async () => {
      await checkCookieBanner();
  });

  it('Cookies preferences should be visible', async() => {
    await checkCookieBanner();
    await showCookiesPreferences();
  });
  
});
