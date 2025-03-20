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
    const VALID_CARD_DATA = JSON.parse(String(process.env.VALID_CARD_DATA));
    const CARD_TEST_DATA = JSON.parse(String(process.env.CARD_TEST_DATA));
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
    const uatLogin = async () => {
        await page.waitForSelector('#spidButton', { visible: true });
        await page.click("#spidButton");
        await sleep(200)
        await page.evaluate(() => {
            document.getElementById('https://validator.dev.oneid.pagopa.it/demo').click()
        })

        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForSelector('form#formLogin');

        await page.type('#username', 'oneidentity');
        await page.type('#password', 'password123');
        await page.click('button[type="submit"]');

        await page.waitForSelector('form[name="formConfirm"]', { visible: true });
        await page.click('form[name="formConfirm"] input[type="submit"]');

        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForSelector('button');
        const button = await page.$x("//button[contains(., 'Team OneIdentity')]");

        expect(button.length).toBeGreaterThan(0);
    }

    const devLogin = async () => {
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForSelector('button');
        const button = await page.$x("//button[contains(., 'NomeTest CognomeTest')]");

        expect(button.length).toBeGreaterThan(0);
    }


    it("Should Login Successfully At Checkout", async() => {
        await page.waitForSelector('#login-header button');
        await page.locator('#login-header button').click();
        if (CHECKOUT_URL.includes("uat")) await uatLogin();
        else await devLogin();
    });

    /**
     * Step 2: Payment (after login)
     */
    it("Should correctly execute a payment", async () => {
        /*
         * 1. Payment with valid notice code
        */
        const CODICE_AVVISO = String(VALID_CARD_DATA.fiscalCodePrefix) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12))
        //const CARD = CARD_TEST_DATA.cards[1];
        const resultMessage = await payNotice(
            CODICE_AVVISO,
            VALID_FISCAL_CODE,
            EMAIL,
            {
                number: String(VALID_CARD_DATA.pan),
                expirationDate: String(VALID_CARD_DATA.expirationDate),
                ccv: String(VALID_CARD_DATA.cvv),
                holderName: "Test test"
            },
            VALID_CARD_DATA.pspAbi
        );

        expect(resultMessage).toContain("Hai pagato");
    });
});