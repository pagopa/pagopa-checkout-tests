import {
  acceptCookiePolicy,
  fillPaymentNotificationForm,
  clearFormByInputId,
  confirmPaymentNotificationForm,
  confirmSummary,
  fillEmailForm } from "./utils/helpers";

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
const CHECKOUT_URL = String(process.env.CHECKOUT_URL);
const EMAIL = String(process.env.EMAIL);
const VERIFYBTN = '#paymentNoticeButtonContinue';
const CONTINUEBTN = '#paymentEmailPageButtonContinue';
const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
const VALID_RANGE_END_NOTICE_CODE = Number(String(process.env.VALID_NOTICE_CODE_PREFIX).concat("9999999999999"));
const VALID_RANGE_START_NOTICE_CODE = Number(String(process.env.VALID_NOTICE_CODE_PREFIX).concat("0000000000000"));


beforeAll( async () => {
  await page.goto(CHECKOUT_URL);
  await page.setViewport({ width: 1200, height: 907 });
  await acceptCookiePolicy();
})

const buttonStatus = async id => await page.$eval(id, ({ disabled }) => disabled);

describe("Checkout notification form", () => {
  beforeEach(async () => {
    await page.goto(`${CHECKOUT_URL}inserisci-dati-avviso`);
  });
    
  test("submit should be inhibited when no data is inserted or the are incorrect", async () => {
    expect(await buttonStatus(VERIFYBTN)).toBeTruthy();

    // note an O carachter beetween zeros
    await fillPaymentNotificationForm('31111010O000009427', VALID_FISCAL_CODE); 
    expect(await buttonStatus(VERIFYBTN)).toBeTruthy();

    // the button status correctly resets
    await clearFormByInputId('#billCode');
    await clearFormByInputId('#cf');
    await fillPaymentNotificationForm('311110100000009427', VALID_FISCAL_CODE);
    expect(await buttonStatus(VERIFYBTN)).toBeFalsy();
    await clearFormByInputId('#billCode');
    await clearFormByInputId('#cf');
    expect(await buttonStatus(VERIFYBTN)).toBeTruthy();
  });

  test("should be possible when data ara inserted and they are correct", async () => {
    await fillPaymentNotificationForm('311110100000009427', VALID_FISCAL_CODE);
    expect(await buttonStatus(VERIFYBTN)).toBeFalsy();
  });  
});

describe("Checkout email form", () => {
  beforeEach(async () => {
    const VALID_NOTICE_CODE = Math.floor(
      Math.random() * (VALID_RANGE_END_NOTICE_CODE - VALID_RANGE_START_NOTICE_CODE + 1) +
      VALID_RANGE_START_NOTICE_CODE
    ).toString();
    await page.goto(`${CHECKOUT_URL}inserisci-dati-avviso`);
    await clearFormByInputId('#billCode');
    await clearFormByInputId('#cf');
    await fillPaymentNotificationForm(VALID_NOTICE_CODE, VALID_FISCAL_CODE);
    await confirmPaymentNotificationForm();
    await confirmSummary();
  });
    
  test("continue button is disabled when emails are wrong, differents or empty", async () => {
    expect(await buttonStatus(CONTINUEBTN)).toBeTruthy();

    // the button status correctly resets
    await fillEmailForm(EMAIL);
    await clearFormByInputId('#email');
    await clearFormByInputId('#confirmEmail');
    expect(await buttonStatus(CONTINUEBTN)).toBeTruthy();

    // emails differs
    await fillEmailForm(EMAIL, 'test@test.com');
    expect(await buttonStatus(CONTINUEBTN)).toBeTruthy();
  });

  test("continue button is active when emails are ok", async () => {
    await fillEmailForm(EMAIL);
    expect(await buttonStatus(CONTINUEBTN)).toBeFalsy();
  });  
});