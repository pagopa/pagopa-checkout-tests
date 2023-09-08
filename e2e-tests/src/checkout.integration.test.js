import {
  payNotice,
  selectKeyboardInput,
  acceptCookiePolicy,
  verifyPaymentAndGetError,
  generateAValidNoticeCode,
} from './utils/helpers';
import {
  EMAIL,
  VALID_FISCAL_CODE,
  INVALID_FISCAL_CODE,
  CVV,
  HOLDER_NAME,
  CHECKOUT_URL,
  CARD_NUMBER_XPAY,
  CARD_NUMBER_VPOS,
  CARD_EXPIRATION_DATE,
} from './utils/const';

describe('Checkout payment activation tests', () => {
  /**
   * Test input and configuration
   */
  const PA_IRRAGGIUNGIBILE_NOTICE_CODE = String(process.env.PA_IRRAGGIUNGIBILE_NOTICE_CODE);

  /**
   * Increase default test timeout (60000ms)
   * to support entire payment flow
   */
  jest.setTimeout(60000);
  jest.retryTimes(3);
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(60000);

  beforeAll(async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
    await acceptCookiePolicy();
  });

  beforeEach(async () => {
    await selectKeyboardInput();
  });

  afterEach(async () => {
    await page.goto(CHECKOUT_URL);
  });

  it('Should correctly execute a payment (xPAY)', async () => {
    /*
     * 1. Payment with valid notice code
     */

    const VALID_NOTICE_CODE = generateAValidNoticeCode();

    const resultMessage = await payNotice(
      VALID_NOTICE_CODE,
      VALID_FISCAL_CODE,
      EMAIL,
      {
        number: CARD_NUMBER_XPAY,
        expirationDate: CARD_EXPIRATION_DATE,
        cvv: CVV,
        holderName: HOLDER_NAME,
      },
      'test12',
    );

    expect(resultMessage).toContain('Grazie, hai pagato');
  });

  it('Should correctly execute a payment (vPOS)', async () => {
    /*
     * 1. Payment with valid notice code
     */

    const VALID_NOTICE_CODE = generateAValidNoticeCode();

    const resultMessage = await payNotice(VALID_NOTICE_CODE, VALID_FISCAL_CODE, EMAIL, {
      number: CARD_NUMBER_VPOS,
      expirationDate: CARD_EXPIRATION_DATE,
      cvv: CVV,
      holderName: HOLDER_NAME,
    });

    expect(resultMessage).toContain('Grazie, hai pagato');
  });

  it('Should fail a payment verify and get PA_IRRAGGIUNGIBILE', async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PA_IRRAGGIUNGIBILE
     */
    const resultMessage = await verifyPaymentAndGetError(PA_IRRAGGIUNGIBILE_NOTICE_CODE, '77777777777');

    expect(resultMessage).toContain('PPT_STAZIONE_INT_PA_SCONOSCIUTA');
  });

  it('Should fail a payment verify and get PPT_DOMINIO_SCONOSCIUTO', async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PPT_DOMINIO_SCONOSCIUTO
     */
    const resultMessage = await verifyPaymentAndGetError(PA_IRRAGGIUNGIBILE_NOTICE_CODE, INVALID_FISCAL_CODE);

    expect(resultMessage).toContain('PPT_DOMINIO_SCONOSCIUTO');
  });
});
