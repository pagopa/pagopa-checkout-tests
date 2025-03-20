
import { selectLanguage } from "../verify/helpers";
import puppeteer from "puppeteer";


describe("Checkout authentication spid", () => {
    /**
     * Test input and configuration
     */
    const CHECKOUT_URL = String(process.env.CHECKOUT_URL);

    const timeout = 80_000
    jest.setTimeout(timeout);
    jest.retryTimes(2);
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


    let browser;
    let page;

    beforeAll( async () => {
        browser = await puppeteer.launch({ headless: "new" });

        const context = await browser.createIncognitoBrowserContext();
        page = await context.newPage();
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

    afterAll(async () => {
        await browser.close();
    });

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

    it("Should Logout Successfully From Checkout", async() => {
        await page.waitForSelector('button');

        await page.evaluate(() => {
            const buttons = document.getElementsByTagName('button')
            buttons[0].click()
            const lis = document.getElementsByTagName('li')
            lis[0].click()
        });
        await sleep(200);

        await page.waitForSelector('#login-header button', { visible: true });

        const button = await page.$x("//button[contains(., 'Accedi')]");
        expect(button.length).toBeGreaterThan(0);
    });
});