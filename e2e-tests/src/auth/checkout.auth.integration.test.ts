
import { selectLanguage } from "../verify/helpers";


describe("Checkout authentication spid", () => {
    /**
     * Test input and configuration
     */
    const CHECKOUT_URL = String(process.env.CHECKOUT_URL);

    const timeout = 80_000
    jest.setTimeout(timeout);
    jest.retryTimes(2);
    page.setDefaultNavigationTimeout(timeout);
    page.setDefaultTimeout(timeout)

    beforeAll( async () => {
        await page.goto(CHECKOUT_URL);
        await page.setViewport({ width: 1200, height: 907 });
        //await acceptCookiePolicy();
    })

    beforeEach(async () => {
        await page.goto(CHECKOUT_URL);
        await selectLanguage("it");
    });


    it("Should Login Successfully At Checkout", async() => {
        await page.waitForSelector('#login-header button');
        await page.locator('#login-header button').click();

        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForSelector('button');
        const button = await page.$x("//button[contains(., 'NomeTest CognomeTest')]");

        expect(button.length).toBeGreaterThan(0);
    });

    it("Should Logout Successfully From Checkout", async() => {
        await page.waitForSelector('button');

        await page.evaluate(() => {
            const buttons = document.getElementsByTagName('button')
            buttons[0].click()
            const lis = document.getElementsByTagName('li')
            lis[0].click()
        });
        const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
        await timeout(200);

        await page.waitForSelector('#login-header button', { visible: true }); // Assicurati che il bottone sia visibile di nuovo

        const button = await page.$x("//button[contains(., 'Accedi')]");
        expect(button.length).toBeGreaterThan(0);
    });
});