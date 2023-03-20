import {
  payNotice,
  selectKeyboardInput,
  acceptCookiePolicy,
  verifyPaymentAndGetError,
  generateAValidNoticeCode,
} from './utils/helpers';
import {
  VALID_CARD_DATA,
  EMAIL,
  VALID_FISCAL_CODE,
  INVALID_FISCAL_CODE,
  CHECKOUT_URL,
  CARD_NUMBER_XPAY,
} from './utils/const';

describe('Checkout payment activation tests', () => {
  /**
   * Test input and configuration
   */
  const VALID_NOTICE_CODE = generateAValidNoticeCode();
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

  it('Should correctly execute a payment (xPAY)', async () => {
    /*
     * 1. Payment with valid notice code
     */
    const resultMessage = await payNotice(VALID_NOTICE_CODE, VALID_FISCAL_CODE, EMAIL, {
      ...VALID_CARD_DATA,
      number: CARD_NUMBER_XPAY,
    });

    expect(resultMessage).toContain('Grazie, hai pagato');
  });

  it.only('Should correctly execute a payment (vPOS)', async () => {
    /*
     * 1. Payment with valid notice code
     */
    const resultMessage = await payNotice(VALID_NOTICE_CODE, VALID_FISCAL_CODE, EMAIL, VALID_CARD_DATA);

    expect(resultMessage).toContain('Grazie, hai pagato');
  });

  it('Should fail a payment verify and get PA_IRRAGGIUNGIBILE', async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PA_IRRAGGIUNGIBILE
     */
    const resultMessage = await verifyPaymentAndGetError(PA_IRRAGGIUNGIBILE_NOTICE_CODE, VALID_FISCAL_CODE);

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
