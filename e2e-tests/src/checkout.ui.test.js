import { acceptCookiePolicy, fillPaymentNotificationForm, clearPaymentNotificationForm } from "./utils/helpers";

/**
 * Increase default test timeout (60000ms)
 * to support entire payment flow
  */
jest.setTimeout(60000);
jest.retryTimes(1);
page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(60000);

describe("Checkout notification form", () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = String(process.env.CHECKOUT_URL);
  const VERIFYBTN = '#paymentNoticeButtonContinue';
  const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
  const INVALID_FISCAL_CODE = String(process.env.INVALID_FISCAL_CODE);

  beforeAll( async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
    await acceptCookiePolicy();
  })
  
  beforeEach(async () => {
    await page.goto(`${CHECKOUT_URL}inserisci-dati-avviso`);
  });
    
  const verifyButtonStatus = async () => await page.$eval(VERIFYBTN, ({ disabled }) => disabled);

  test("submit should be inhibited when no data is inserted or the are incorrect", async () => {
    expect(await verifyButtonStatus()).toBeTruthy();

    // note an O carachter beetween zeros
    await fillPaymentNotificationForm('31111010O000009427', VALID_FISCAL_CODE); 
    expect(await verifyButtonStatus()).toBeTruthy();

    // the button status correctly resets
    await clearPaymentNotificationForm();
    await fillPaymentNotificationForm('311110100000009427', VALID_FISCAL_CODE);
    await clearPaymentNotificationForm();
    expect(await verifyButtonStatus()).toBeTruthy();
  });

  test("should be possible when data ara inserted and they are correct", async () => {
    await fillPaymentNotificationForm(311110100000009427, VALID_FISCAL_CODE);
    expect(await verifyButtonStatus()).toBeFalsy();
  });  
});
  