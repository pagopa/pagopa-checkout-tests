import { payNotice, acceptCookiePolicy, verifyPayment } from './utils/helpers.js';

describe('Checkout payments tests -', () => {
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
  const INVALID_CARD_DATA = {
    number: '4801769871971639',
    expirationDate: '1230',
    ccv: '123',
    holderName: 'Mario Rossi'
  }
  const VALID_NOTICE_CODE = Math.floor(
    Math.random() * (302001999999999999 - 302001000000000000 + 1) + 302001000000000000,
  ).toString();

  /**
   * Increase default test timeout (5000ms)
   * to support entire payment flow
   */
   jest.setTimeout(60000);
   jest.retryTimes(3);
   page.setDefaultNavigationTimeout(60000);
   page.setDefaultTimeout(60000)

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
  });

  beforeAll( async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
    await acceptCookiePolicy();
  })

  
  it('Should correctly verify a payment', async () => {
    /*
     * 1. Verify with valid notice code
    */
   await verifyPayment(VALID_NOTICE_CODE, VALID_FISCAL_CODE, EMAIL, VALID_CARD_DATA);
  });

  it('Should correctly execute a payment (VPOS authorization - 3DS2 step: methodURL)', async () => {
    /*
     * 2. Valid payment with valid notice code
    */
   const resultMessage = await payNotice(VALID_NOTICE_CODE, VALID_FISCAL_CODE, EMAIL, VALID_CARD_DATA);

    expect(resultMessage).toContain('Grazie, hai pagato');
  });

  it('Should fail to execute a payment. Unauthorized credit card', async () => {
    /*
     * 3. Payment with valid notice code and not authorized card
    */
   const resultMessage = await payNotice(VALID_NOTICE_CODE, VALID_FISCAL_CODE, EMAIL, INVALID_CARD_DATA);
    expect(resultMessage).toContain('Autorizzazione negata');
  });
});
