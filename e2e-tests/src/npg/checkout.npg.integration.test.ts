
import { verifyActivatePaymentTest } from "../verify/helpers";
import { payNotice, acceptCookiePolicy,  generateRandomNoticeCode, selectLanguage } from "./helpers";



describe("Checkout payment activation tests", () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = String(process.env.CHECKOUT_URL);
  const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
  const EMAIL = String(process.env.EMAIL);
  const CARD_TEST_DATA = JSON.parse(String(process.env.CARD_TEST_DATA));
  /**
   * Increase default test timeout (60000ms)
   * to support entire payment flow
    */
  const timeout = 80_000
  jest.setTimeout(timeout);
  jest.retryTimes(2);
  page.setDefaultNavigationTimeout(timeout);
  page.setDefaultTimeout(timeout)

  beforeAll( async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
    await acceptCookiePolicy();
    await selectLanguage('it');
  })

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
  });

  // execute verify-activate payment tests
  verifyActivatePaymentTest();

  const languages = [
    {
      loc: "it",
      value: "Hai pagato"
    },
    {
      loc: "en",
      value: "You have paid "
    },
    {
      loc: "fr",
      value: "Vous avez payé "
    },
    {
      loc: "de",
      value: "Du hast "
    },
    {
      loc: "sl",
      value: "Plačali ste "
    }
  ]

  languages.forEach(language => {
    it.each(CARD_TEST_DATA.cards.filter(el => !el.skipTest))("Should correctly execute a payment with configuration %s", async (testData) => {
      // select language
      selectLanguage(language.loc);

      console.log(`language selected: ${language.loc}`);
      /*
       * 1. Payment with valid notice code
      */
      const resultMessage = await payNotice(
        generateRandomNoticeCode(testData.fiscalCodePrefix),
        VALID_FISCAL_CODE,
        EMAIL,
        {
          number: String(testData.pan),
          expirationDate: String(testData.expirationDate),
          ccv: String(testData.cvv),
          holderName: "Test test"
        },
        testData.pspAbi
      );
  
      expect(resultMessage).toContain(language.value);
    });
  });
});
