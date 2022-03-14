import { payNotice, acceptCookiePolicy } from './utils/helpers.js';

describe('Checkout payment activation tests', () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = 'https://dev.checkout.pagopa.it/';
  const VALID_FISCAL_CODE = '77777777777';
  const EMAIL = 'mario.rossi@email.com';
  const VALID_CARD_DATA = {
    number: '4333334000098346',
    expirationDate: '1230',
    ccv: '123',
    holderName: 'Mario Rossi',
  }
  const VALID_NOTICE_CODE = Math.floor(
    Math.random() * (302001999999999999 - 302001000000000000 + 1) + 302001000000000000,
  ).toString();

  /**
   * Increase default test timeout (5000ms)
   * to support entire payment flow
   */
  jest.setTimeout(60000);

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
  });


  it('Should correctly execute a payment', async () => {
    /*
     * 1. Payment with valid notice code
    */
   await acceptCookiePolicy();
   const resultMessage = await payNotice(VALID_NOTICE_CODE, VALID_FISCAL_CODE, EMAIL, VALID_CARD_DATA);

    expect(resultMessage).toContain('Grazie, hai pagato');
  });

});
