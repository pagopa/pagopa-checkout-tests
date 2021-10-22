import { verifyPaymentAndGetError, verifyPaymentAndGetErrorCode } from './utils/helpers.js';
import { acceptCookiesBanner } from './utils/helpers.js'


describe('Checkout payment activation tests', () => {
  /**
   * Test input and configuration
   */
  const IO_PAY_PORTAL_URL = process.env.IO_PAY_PORTAL_URL;
  const PAID_NOTICE_CODE = process.env.PAID_NOTICE_CODE;
  const PAID_FISCAL_CODE_PA = process.env.PAID_FISCAL_CODE_PA;
  const INVALID_NOTICE_CODE = process.env.INVALID_NOTICE_CODE;
  const INVALID_FISCAL_CODE_PA = process.env.INVALID_FISCAL_CODE_PA;
  const VALID_NOTICE_CODE = process.env.VALID_NOTICE_CODE;

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
     * 1. Payment Activation with paid notice code 
     *  */
    await acceptCookiesBanner();
    const errorDescription = await verifyPaymentAndGetError(PAID_NOTICE_CODE, PAID_FISCAL_CODE_PA);

    expect(errorDescription).toContain("Questo avviso è stato già pagato!");
  });

  it('Should return a message indicating invalid notice code', async () => {
    /**
     * 1. Payment Activation with invalid notice code
     **/
    const errorDescription = await verifyPaymentAndGetErrorCode(INVALID_NOTICE_CODE, PAID_FISCAL_CODE_PA);
    
    expect(errorDescription).toContain("PAA_PAGAMENTO_SCONOSCIUTO");
  });

  it('Should return a message indicating invalid fiscal code', async () => {
    /**
     * 1. Payment Activation with invalid PA fiscal code
    **/
   const errorDescription = await verifyPaymentAndGetErrorCode(VALID_NOTICE_CODE, INVALID_FISCAL_CODE_PA);
   
   expect(errorDescription).toContain("PPT_DOMINIO_SCONOSCIUTO");
  });


});
