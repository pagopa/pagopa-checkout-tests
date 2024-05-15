
import { payNotice, acceptCookiePolicy,  generateRandomNoticeCode } from "./helpers";
import { CodeCategory, EMAIL, TestData, TestExecutor, VALID_FISCAL_CODE } from "./type.tests";



describe("Checkout payment activation tests", () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = String(process.env.CHECKOUT_URL);

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
  jest.retryTimes(2);
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

  // run all tests defined in the testCases map (TestExecutor) for each card.
  CARD_TEST_DATA.cards.filter(el => !Boolean(el.skipTest)).forEach( 
    (testData:TestData) => {
      let testExc = new TestExecutor(testData);
      [...testExc.testCases.keys()].forEach( key => {
        it.each([testData])(CodeCategory[key], async() => {await testExc.runTests(testData, key)})
      })
    });
});

