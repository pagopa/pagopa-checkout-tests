
import { payNotice, acceptCookiePolicy, verifyPaymentAndGetError } from "./helpers";

describe("Checkout payment activation tests", () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = String(process.env.CHECKOUT_URL);
  const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
  const INVALID_FISCAL_CODE = String(process.env.INVALID_FISCAL_CODE)
  const EMAIL = String(process.env.EMAIL);
  const VALID_CARD_DATA = {
    number: String(process.env.CARD_NUMBER),
    expirationDate: String(process.env.CARD_EXPIRATION_DATE),
    ccv: String(process.env.CARD_CCV),
    holderName: String(process.env.CARD_HOLDER_NAME)
  };

  const VALID_RANGE_END_NOTICE_CODE = Number(String(process.env.VALID_NOTICE_CODE_PREFIX).concat("9999999999999"));
  const VALID_RANGE_START_NOTICE_CODE = Number(String(process.env.VALID_NOTICE_CODE_PREFIX).concat("0000000000000"));

  const VALID_NOTICE_CODE = Math.floor(
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
    await acceptCookiePolicy();
  })

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
  });
  
  it.only("Should correctly execute a payment", async () => {
    /*
     * 1. Payment with valid notice code
    */
    const resultMessage = await payNotice(
      VALID_NOTICE_CODE,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );

    expect(resultMessage).toContain("Grazie, hai pagato");
  });
  
  it("Should fail a payment verify and get PA_IRRAGGIUNGIBILE", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PA_IRRAGGIUNGIBILE
     */
    const resultMessage = await verifyPaymentAndGetError(PA_IRRAGGIUNGIBILE_NOTICE_CODE, VALID_FISCAL_CODE);
                                                                                                             
    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_SCONOSCIUTA");
  });

  it("Should fail a payment verify and get PPT_DOMINIO_SCONOSCIUTO", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PPT_DOMINIO_SCONOSCIUTO
     */
    const resultMessage = await verifyPaymentAndGetError(PA_IRRAGGIUNGIBILE_NOTICE_CODE, INVALID_FISCAL_CODE);
                                                                                                             
    expect(resultMessage).toContain("PPT_DOMINIO_SCONOSCIUTO");
  });


});
