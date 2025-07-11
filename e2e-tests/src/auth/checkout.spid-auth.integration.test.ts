
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

    it("Should perform login and logout operation successfully", async() => {
        //#1 perform login 
        await page.waitForSelector('#login-header button');
        await page.locator('#login-header button').click();
        if (CHECKOUT_URL.includes("uat")) await oneIdentityLogin(page);
        else await identityProviderMock(page);
        await page.waitForSelector('button');

        //#2 click on user button and search for exit sub menu  
        await page.evaluate(() => {
            const buttons = document.getElementsByTagName('button')
            buttons[0].click()
            const lis = document.getElementsByTagName('li')
            lis[0].click()
        });
        //#3 confirm logout operation
        const confirmButton = await page.waitForSelector("#logoutModalConfirmButton");
        await confirmButton.click();
        await sleep(500);
        //#4 check that login button is visible again after logout
        const button = await page.waitForSelector('#login-header button', { visible: true });
        expect(button).not.toBeNull();
    });

});