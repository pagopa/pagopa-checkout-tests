import { activatePayment, payAndGetSuccessMessage, acceptCookiesBanner } from './utils/helpers.js';

describe('checkout tests', () => {
  /**
   * Test input and configuration
   */
  const IO_PAY_PORTAL_URL = process.env.IO_PAY_PORTAL_URL;
  const VALID_NOTICE_CODE = process.env.VALID_NOTICE_CODE;
  const VALID_FISCAL_CODE_PA = process.env.VALID_FISCAL_CODE_PA;
  const VALID_USER_MAIL = process.env.VALID_USER_MAIL;
  const CREDIT_CARD_HOLDER = process.env.CREDIT_CARD_HOLDER;
  const CREDIT_CARD_NUMBER = process.env.CREDIT_CARD_NUMBER;
  const CREDIT_CARD_EXPIRATION_DATE = process.env.CREDIT_CARD_EXPIRATION_DATE;
  const CREDIT_CARD_SECURE_CODE = process.env.CREDIT_CARD_SECURE_CODE;
  
  /**
   * Increase default test timeout (5000ms)
   * to support entire payment flow
   */
  jest.setTimeout(30000);

  beforeEach(async () => {
    await page.goto(IO_PAY_PORTAL_URL);
    await page.setViewport({ width: 1200, height: 907 });
    
  });

  it('Should complete the payment 3ds2 when valid credit card is entered', async () => {
    
    /*
    * 0. Accept the cookies policies banner
    **/
    await acceptCookiesBanner();

    /**
     * 1. Payment Activation
     */
    await activatePayment(VALID_NOTICE_CODE, VALID_FISCAL_CODE_PA);

    await page.waitForNavigation();

    /**
     * 2. Pay - Payment
     *  */
    const successMessage = await payAndGetSuccessMessage(
      VALID_USER_MAIL,
      CREDIT_CARD_HOLDER,
      CREDIT_CARD_NUMBER,
      CREDIT_CARD_EXPIRATION_DATE,
      CREDIT_CARD_SECURE_CODE,
    );

    expect(successMessage).toContain("Grazie, l'operazione è stata eseguita con successo!");

  });
});
