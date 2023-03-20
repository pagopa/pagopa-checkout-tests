import {
  acceptCookiePolicy,
  clearInputById,
  confirmPaymentNotificationForm,
  confirmSummary,
  fillInputById,
  generateAValidNoticeCode,
} from './utils/helpers';

/**
 * Increase default test timeout (60000ms)
 * to support entire payment flow
 */
jest.setTimeout(60000);
jest.retryTimes(1);
page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(60000);

/**
 * Test input and configuration
 */
const CHECKOUT_URL = String(process.env.CHECKOUT_URL),
  EMAIL = String(process.env.EMAIL),
  VERIFY_BUTTON_ID = '#paymentNoticeButtonContinue',
  CONTINUE_BUTTON_ID = '#paymentEmailPageButtonContinue',
  BILL_CODE_ID = '#billCode',
  CF_ID = '#cf',
  EMAIL_ID = '#email',
  CHECK_EMAIL_ID = '#confirmEmail',
  VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);

beforeAll(async () => {
  await page.goto(CHECKOUT_URL);
  await page.setViewport({ width: 1200, height: 900 });
  await acceptCookiePolicy();
});

const isButtonDisabled = async id => await page.$eval(id, ({ disabled }) => disabled);

describe('Checkout notification form:', () => {
  beforeEach(async () => {
    await page.goto(`${CHECKOUT_URL}inserisci-dati-avviso`);
  });

  test('submit should be inhibited when wrong data or no data are inserted', async () => {
    expect(await isButtonDisabled(VERIFY_BUTTON_ID)).toBeTruthy();

    // Note an O carachter beetween zeros
    await fillInputById(BILL_CODE_ID, '31111010O000009427');
    await fillInputById(CF_ID, VALID_FISCAL_CODE);
    expect(await isButtonDisabled(VERIFY_BUTTON_ID)).toBeTruthy();

    // The button status correctly resets
    await clearInputById(BILL_CODE_ID);
    await fillInputById(BILL_CODE_ID, '311110100000009427');
    expect(await isButtonDisabled(VERIFY_BUTTON_ID)).toBeFalsy();
    await clearInputById(BILL_CODE_ID);
    await clearInputById(CF_ID);
    expect(await isButtonDisabled(VERIFY_BUTTON_ID)).toBeTruthy();
  });

  test('submit should be possible when data id ok', async () => {
    await fillInputById(BILL_CODE_ID, '311110100000009427');
    await fillInputById(CF_ID, VALID_FISCAL_CODE);
    expect(await isButtonDisabled(VERIFY_BUTTON_ID)).toBeFalsy();
  });
});

describe('Checkout email form:', () => {
  beforeEach(async () => {
    const VALID_NOTICE_CODE = generateAValidNoticeCode();
    await page.goto(`${CHECKOUT_URL}inserisci-dati-avviso`);
    await clearInputById(BILL_CODE_ID);
    await clearInputById(CF_ID);
    await fillInputById(BILL_CODE_ID, VALID_NOTICE_CODE);
    await fillInputById(CF_ID, VALID_FISCAL_CODE);
    await confirmPaymentNotificationForm();
    await confirmSummary();
  });

  test('continue button is disabled when emails are wrong, differents or empty', async () => {
    expect(await isButtonDisabled(CONTINUE_BUTTON_ID)).toBeTruthy();

    // The continue button status correctly resets
    await fillInputById(EMAIL_ID, EMAIL);
    await fillInputById(CHECK_EMAIL_ID, EMAIL);
    expect(await isButtonDisabled(CONTINUE_BUTTON_ID)).toBeFalsy();
    await clearInputById(EMAIL_ID);
    await clearInputById(CHECK_EMAIL_ID);
    expect(await isButtonDisabled(CONTINUE_BUTTON_ID)).toBeTruthy();

    // Emails values are different
    await fillInputById(EMAIL_ID, EMAIL);
    await fillInputById(CHECK_EMAIL_ID, 'test@test.com');
    expect(await isButtonDisabled(CONTINUE_BUTTON_ID)).toBeTruthy();
  });

  test('continue button is active when emails are ok', async () => {
    await fillInputById(EMAIL_ID, EMAIL);
    await fillInputById(CHECK_EMAIL_ID, EMAIL);
    expect(await isButtonDisabled(CONTINUE_BUTTON_ID)).toBeFalsy();
  });
});
