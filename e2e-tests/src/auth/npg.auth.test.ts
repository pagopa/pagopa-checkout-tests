import {selectLanguage} from "../verify/helpers";
import { verifyActivatePaymentTest } from "../verify/helpers";
import { payNotice, generateRandomNoticeCode } from "../npg/helpers";

describe("Checkout login and payment flow", () => {
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
    const timeout = 80_000;
    jest.setTimeout(timeout);
    jest.retryTimes(2);
    page.setDefaultNavigationTimeout(timeout);
    page.setDefaultTimeout(timeout);

    beforeAll(async () => {
        await page.goto(CHECKOUT_URL);
        await page.setViewport({ width: 1200, height: 907 });
        //await acceptCookiePolicy();
    });

    beforeEach(async () => {
        await page.goto(CHECKOUT_URL);
        await selectLanguage("it");
    });

    /**
     * Step 1: Login
     */
    it("Should successfully login in checkout", async () => {
        await page.waitForSelector('#login-header button');
        await page.locator('#login-header button').click();

        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForSelector('button');

        const button = await page.$x("//button[contains(., 'NomeTest CognomeTest')]");
        expect(button.length).toBeGreaterThan(0);
    });

    /**
     * Step 2: Payment (dopo login)
     */
    verifyActivatePaymentTest();

    it.each(CARD_TEST_DATA.cards.filter(el => !Boolean(el.skipTest)))("Should correctly execute a payment with configuration %s", async (testData) => {
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

        expect(resultMessage).toContain("Hai pagato");
    });
});