
import puppeteer from "puppeteer";
import {identityProviderMock, oneIdentityLogin, sleep} from "./helpers";


describe("Checkout authentication spid", () => {
    /**
     * Test input and configuration
     */
    const CHECKOUT_URL = String(process.env.CHECKOUT_URL);

    const timeout = 80_000
    jest.setTimeout(timeout);
    jest.retryTimes(2);

    beforeAll( async () => {
        await page.goto(CHECKOUT_URL);
        await page.setViewport({ width: 1200, height: 907 });
        page.setDefaultNavigationTimeout(timeout);
        page.setDefaultTimeout(timeout)
        //await acceptCookiePolicy();
    })

    beforeEach(async () => {
        await page.goto(CHECKOUT_URL);
        await page.waitForSelector('#languageMenu', { timeout: 10000 });
        await page.select('#languageMenu', "it")
        //await selectLanguage("it");
    });

    it("Should Login Successfully At Checkout", async() => {
        await page.waitForSelector('#login-header button');
        await page.locator('#login-header button').click();
        if (CHECKOUT_URL.includes("uat")) await oneIdentityLogin(page);
        else await identityProviderMock(page);
    });

    it("Should Logout Successfully From Checkout", async() => {
        await page.waitForSelector('button');

        await page.evaluate(() => {
            const buttons = document.getElementsByTagName('button')
            buttons[0].click()
            const lis = document.getElementsByTagName('li')
            lis[0].click()
        });
        await sleep(500);
        const confirmButton = await page.waitForSelector("#logoutModalConfirmButton");
        await confirmButton.click();
        await page.waitForSelector('#login-header button', { visible: true });
        const button = await page.$x("//button[contains(., 'Accedi')]");
        expect(button.length).toBeGreaterThan(0);
    });
});