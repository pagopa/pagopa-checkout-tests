
import { payNotice, acceptCookiePolicy,  generateRandomNoticeCode } from "./helpers";



describe("Checkout payment activation tests", () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = String(process.env.CHECKOUT_URL);
  const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
  const EMAIL = String(process.env.EMAIL);
  const VALID_CARD_DATA = {
    number: String(process.env.CARD_NUMBER),
    expirationDate: String(process.env.CARD_EXPIRATION_DATE),
    ccv: String(process.env.CARD_CCV),
    holderName: String(process.env.CARD_HOLDER_NAME)
  };

  const NPG_PSP_ABI = String(process.env.NPG_PSP_ABI);
  const CARD_TEST_DATA = JSON.parse(String(process.env.CARD_TEST_DATA));
  /**
   * Increase default test timeout (60000ms)
   * to support entire payment flow
    */
  const timeout = 80_000
  jest.setTimeout(timeout);
  jest.retryTimes(3);
  page.setDefaultNavigationTimeout(timeout);
  page.setDefaultTimeout(timeout)

  beforeAll( async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
    await acceptCookiePolicy();
  })

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
  });
  
  it("Should correctly execute a payment with PSP Nexi", async () => {
    /*
     * 1. Payment with valid notice code
    */
    const resultMessage = await payNotice(
      generateRandomNoticeCode(CARD_TEST_DATA.nexi.fiscalCodePrefix),
      VALID_FISCAL_CODE,
      EMAIL,
      {
        number: String(CARD_TEST_DATA.nexi.pan),
        expirationDate: String(CARD_TEST_DATA.nexi.expirationDate),
        ccv: String(CARD_TEST_DATA.nexi.cvv),
        holderName: "Test test"
      },
      CARD_TEST_DATA.nexi.pspAbi
    );

    expect(resultMessage).toContain("Grazie, hai pagato");
  });

  it("Should correctly execute a payment with PSP Intesa", async () => {
    /*
     * 1. Payment with valid notice code
    */
    const resultMessage = await payNotice(
      generateRandomNoticeCode(CARD_TEST_DATA.intesa.fiscalCodePrefix),
      VALID_FISCAL_CODE,
      EMAIL,
      {
        number: String(CARD_TEST_DATA.intesa.pan),
        expirationDate: String(CARD_TEST_DATA.intesa.expirationDate),
        ccv: String(CARD_TEST_DATA.intesa.cvv),
        holderName: "Test test"
      },
      CARD_TEST_DATA.intesa.pspAbi
    );

    expect(resultMessage).toContain("Grazie, hai pagato");
  });

  it.skip("Should correctly execute a payment with PSP Unicredit", async () => {
    /*
     * 1. Payment with valid notice code
    */
    const resultMessage = await payNotice(
      generateRandomNoticeCode(CARD_TEST_DATA.unicredit.fiscalCodePrefix),
      VALID_FISCAL_CODE,
      EMAIL,
      {
        number: String(CARD_TEST_DATA.unicredit.pan),
        expirationDate: String(CARD_TEST_DATA.unicredit.expirationDate),
        ccv: String(CARD_TEST_DATA.unicredit.cvv),
        holderName: "Test test"
      },
      CARD_TEST_DATA.unicredit.pspAbi
    );

    expect(resultMessage).toContain("Grazie, hai pagato");
  });

  it.skip("Should correctly execute a payment with PSP Poste", async () => {
    /*
     * 1. Payment with valid notice code
    */
    const resultMessage = await payNotice(
    generateRandomNoticeCode(CARD_TEST_DATA.poste.fiscalCodePrefix),
    VALID_FISCAL_CODE,
    EMAIL,
    {
      number: String(CARD_TEST_DATA.poste.pan),
      expirationDate: String(CARD_TEST_DATA.poste.expirationDate),
      ccv: String(CARD_TEST_DATA.poste.cvv),
      holderName: "Test test"
    },
    CARD_TEST_DATA.poste.pspAbi
    );

    expect(resultMessage).toContain("Grazie, hai pagato");
  });

  it.skip("Should correctly execute a payment with PSP Postepay", async () => {
    /*
     * 1. Payment with valid notice code
    */
    const resultMessage = await payNotice(
    generateRandomNoticeCode(CARD_TEST_DATA.postepay.fiscalCodePrefix),
    VALID_FISCAL_CODE,
    EMAIL,
    {
      number: String(CARD_TEST_DATA.postepay.pan),
      expirationDate: String(CARD_TEST_DATA.postepay.expirationDate),
      ccv: String(CARD_TEST_DATA.postepay.cvv),
      holderName: "Test test"
    },
    CARD_TEST_DATA.postepay.pspAbi
    );

    expect(resultMessage).toContain("Grazie, hai pagato");
  });

});

