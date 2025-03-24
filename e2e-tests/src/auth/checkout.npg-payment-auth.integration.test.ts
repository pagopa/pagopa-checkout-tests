import {selectLanguage} from "../verify/helpers";
import { payNotice } from "../npg/helpers";
import {identityProviderMock, oneIdentityLogin} from "./helpers";

describe("Checkout login and payment flow", () => {
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
    it("Should perform login successfully", async() => {
        await page.waitForSelector('#login-header button');
        await page.locator('#login-header button').click();
        if (CHECKOUT_URL.includes("uat")) await oneIdentityLogin(page);
        else await identityProviderMock(page);
    });

    /**
     * Step 2: Payment (after login)
     */
    it("Should correctly execute a payment", async() => {
        /*
         * 1. Payment with valid notice code
        */
        const cardData = CARD_TEST_DATA.cards.find(card => card.testingPsp == "Worldpay");
        const noticeNumber = String(cardData.fiscalCodePrefix) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12));

        const resultMessage = await payNotice(
            noticeNumber,
            VALID_FISCAL_CODE,
            EMAIL,
            {
                number: String(cardData.pan),
                expirationDate: String(cardData.expirationDate),
                ccv: String(cardData.cvv),
                holderName: "Test test"
            },
            cardData.pspAbi
        );

        expect(resultMessage).toContain("Hai pagato");
    });
});