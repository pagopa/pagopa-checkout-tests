import {
  acceptCookiePolicy,
  generateAValidNoticeCode,
  fillInputById,
  clearInputById,
  confirmPaymentNotificationForm,
  confirmSummary,
  confirmEmailForm,
  choosePaymentMethod,
  isButtonDisabled,
} from './utils/helpers';
import {
  CHECKOUT_URL,
  BILL_CODE_ID,
  CF_ID,
  VALID_FISCAL_CODE,
  EMAIL_ID,
  CHECK_EMAIL_ID,
  EMAIL,
  VERIFY_BUTTON_ID,
  CONTINUE_BUTTON_ID,
  CONTINUE_PAYMENT_BUTTON,
  CARD_NUMBER_INPUT,
  VALID_CARD_DATA,
  EXPIRATION_DATE_INPUT,
  CCV_INPUT,
  HOLDER_NAME_INPUT,
} from './utils/const';

/**
 * Increase default test timeout (60000ms)
 * to support entire payment flow
 */
jest.setTimeout(60000);
jest.retryTimes(1);
page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(60000);

beforeAll(async () => {
  await page.goto(CHECKOUT_URL);
  await page.setViewport({ width: 1200, height: 900 });
  await acceptCookiePolicy();
});

describe('Checkout notification form:', () => {
  beforeEach(async () => {
    await page.goto(`${CHECKOUT_URL}inserisci-dati-avviso`);
  });

  test('submit should be inhibited when wrong data or no data are inserted', async () => {
    expect(await isButtonDisabled(VERIFY_BUTTON_ID)).toBeTruthy();

    // a typo: note the O caracther beetween numbers
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

  test('submit should be possible when data is ok', async () => {
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

describe('Checkout cart form:', () => {
  beforeAll(async () => {
    const VALID_NOTICE_CODE = generateAValidNoticeCode();
    await page.goto(`${CHECKOUT_URL}inserisci-dati-avviso`);
    await clearInputById(BILL_CODE_ID);
    await clearInputById(CF_ID);

    await fillInputById(BILL_CODE_ID, VALID_NOTICE_CODE);
    await fillInputById(CF_ID, VALID_FISCAL_CODE);
    await confirmPaymentNotificationForm();

    await confirmSummary();

    await fillInputById(EMAIL_ID, EMAIL);
    await fillInputById(CHECK_EMAIL_ID, EMAIL);
    await confirmEmailForm();

    await choosePaymentMethod('card');
  });

  beforeEach(async () => {
    await clearInputById(CARD_NUMBER_INPUT);
    await clearInputById(EXPIRATION_DATE_INPUT);
    await clearInputById(CCV_INPUT);
    await clearInputById(HOLDER_NAME_INPUT);
  });

  test('continue button is disabled initially', async () => {
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeTruthy();
  });

  test('continue button is enabled only when all data are inserted', async () => {
    await fillInputById(CARD_NUMBER_INPUT, VALID_CARD_DATA.number);
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeTruthy();
    await fillInputById(EXPIRATION_DATE_INPUT, VALID_CARD_DATA.expirationDate);
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeTruthy();
    await fillInputById(CCV_INPUT, VALID_CARD_DATA.ccv);
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeTruthy();
    await fillInputById(HOLDER_NAME_INPUT, VALID_CARD_DATA.holderName);
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeFalsy();
  });

  test('continue button is enabled only when all data are ok', async () => {
    // a typo: note the O caracther beetween numbers
    await fillInputById(CARD_NUMBER_INPUT, '51111140O0023477');
    // a wrong date
    await fillInputById(EXPIRATION_DATE_INPUT, '1220');
    // missing ccv
    //empty holder name
    await fillInputById(HOLDER_NAME_INPUT, '');
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeTruthy();
  });

  test('continue button status resets properly', async () => {
    await fillInputById(CARD_NUMBER_INPUT, VALID_CARD_DATA.number);
    await fillInputById(EXPIRATION_DATE_INPUT, VALID_CARD_DATA.expirationDate);
    await fillInputById(CCV_INPUT, VALID_CARD_DATA.ccv);
    await fillInputById(HOLDER_NAME_INPUT, VALID_CARD_DATA.holderName);
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeFalsy();
    await clearInputById(CARD_NUMBER_INPUT);
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeTruthy();
    await clearInputById(EXPIRATION_DATE_INPUT);
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeTruthy();
    await clearInputById(CCV_INPUT);
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeTruthy();
    await clearInputById(HOLDER_NAME_INPUT);
    expect(await isButtonDisabled(CONTINUE_PAYMENT_BUTTON)).toBeTruthy();
  });
});
