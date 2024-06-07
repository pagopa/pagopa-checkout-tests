
import { verifyActivatePaymentTest } from "../verify/helpers";
import { payNotice, verifyPaymentAndGetError } from "./helpers";

describe("Checkout payment activation tests", () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = String(process.env.CHECKOUT_URL);
  const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
  const INVALID_FISCAL_CODE = String(process.env.INVALID_FISCAL_CODE)
  const EMAIL = String(process.env.EMAIL);

  const ABI_PSP_VPOS = String(process.env.ABI_PSP_VPOS);
  const ABI_PSP_XPAY = String(process.env.ABI_PSP_XPAY);

  const VALID_CARD_DATA_XPAY = {
    number: String(process.env.CARD_NUMBER_XPAY),
    expirationDate: String(process.env.CARD_EXPIRATION_DATE_XPAY),
    ccv: String(process.env.CARD_CCV_XPAY),
    holderName: String(process.env.CARD_HOLDER_NAME_XPAY)
  };

  const VALID_CARD_DATA_VPOS = {
    number: String(process.env.CARD_NUMBER_VPOS),
    expirationDate: String(process.env.CARD_EXPIRATION_DATE_VPOS),
    ccv: String(process.env.CARD_CCV_VPOS),
    holderName: String(process.env.CARD_HOLDER_NAME_VPOS)
  };

  const VALID_RANGE_END_NOTICE_CODE = Number(String(process.env.VALID_NOTICE_CODE_PREFIX).concat("9999999999999"));
  const VALID_RANGE_START_NOTICE_CODE = Number(String(process.env.VALID_NOTICE_CODE_PREFIX).concat("0000000000000"));

  const VALID_NOTICE_CODE_XPAY = Math.floor(
    Math.random() * (VALID_RANGE_END_NOTICE_CODE - VALID_RANGE_START_NOTICE_CODE + 1) +
    VALID_RANGE_START_NOTICE_CODE
  ).toString();

  const VALID_NOTICE_CODE_VPOS = Math.floor(
    Math.random() * (VALID_RANGE_END_NOTICE_CODE - VALID_RANGE_START_NOTICE_CODE + 1) +
    VALID_RANGE_START_NOTICE_CODE
  ).toString();
  
  const PA_IRRAGGIUNGIBILE_NOTICE_CODE = String(process.env.PA_IRRAGGIUNGIBILE_NOTICE_CODE)

  /**
   * Increase default test timeout (60000ms)
   * to support entire payment flow
    */
  jest.setTimeout(60000);
  jest.retryTimes(3);
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(60000)

  beforeAll( async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
  })

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
  });

  // execute verify/activate payment tests
  verifyActivatePaymentTest();

  it("Should correctly execute a payment for xpay", async () => {
    
    /*
     * 1. Payment with valid notice code
    */
    const resultMessage = await payNotice(
      VALID_NOTICE_CODE_XPAY,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA_XPAY,
      ABI_PSP_XPAY,
      true
    );

    expect(resultMessage).toContain("Grazie, hai pagato");

  });

  it("Should correctly execute a payment for vpos", async () => {
    /*
     * 1. Payment with valid notice code
    */
    const resultMessage = await payNotice(
      VALID_NOTICE_CODE_VPOS,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA_VPOS,
      ABI_PSP_VPOS,
      false
    );

    expect(resultMessage).toContain("Grazie, hai pagato");

  });

});
