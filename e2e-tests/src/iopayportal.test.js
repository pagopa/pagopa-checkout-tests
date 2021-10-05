import { verifyPaymentAndGetError } from './utils/helpers.js';

describe('io-pay-portal tests', () => {
  /**
   * Test input and configuration
   */
  const IO_PAY_PORTAL_URL = process.env.IO_PAY_PORTAL_URL;
  const PAID_NOTICE_CODE = process.env.PAID_NOTICE_CODE;
  const PAID_FISCAL_CODE_PA = process.env.PAID_FISCAL_CODE_PA;

  /**
   * Increase default test timeout (5000ms)
   * to support entire payment flow
   */
  jest.setTimeout(30000);

  beforeEach(async () => {
    await page.goto(IO_PAY_PORTAL_URL);
    await page.setViewport({ width: 1200, height: 907 });
  });

  it('Should return a message indicating duplicate payment if the notice_code has already been paid', async () => {
    /**
     * 1. Payment Activation - io-pay-portal
     *  */
   const errorDescription = await verifyPaymentAndGetError(PAID_NOTICE_CODE, PAID_FISCAL_CODE_PA);

   expect(errorDescription).toContain("Questo avviso è stato già pagato!");
  });
});
