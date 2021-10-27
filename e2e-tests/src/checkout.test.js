import { activatePayment, payAndGetSuccessMessage, acceptCookiesBanner } from './utils/helpers.js';

describe('checkout tests', () => {
  /**
   * Test input and configuration
   */
  const IO_PAY_PORTAL_URL = "https://api.uat.platform.pagopa.it";
  const VALID_NOTICE_CODE = Math.floor(Math.random() * (302001999999999999 - 302001000000000000 + 1) + 302001000000000000);
  const VALID_FISCAL_CODE_PA = "77777777777";
  const VALID_USER_MAIL = "test@test.it";
  const CREDIT_CARD_HOLDER = "Mario Rossi";
  const CREDIT_CARD_NUMBER = "5111114000023477";
  const CREDIT_CARD_EXPIRATION_DATE = "12/30";
  const CREDIT_CARD_SECURE_CODE = "123";
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
