import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import puppeteer, { Browser } from 'puppeteer';
import { expect } from 'expect';
import { CheckoutWorld } from './world';

// Make expect globally available (used by shared helpers written for Jest)
(globalThis as any).expect = expect;

const TIMEOUT = 80_000;
setDefaultTimeout(TIMEOUT);

let browser: Browser;

BeforeAll(async function () {
    browser = await puppeteer.launch({
        headless: true,
        dumpio: true,
        args: ['--no-sandbox'],
    });
});

Before(async function (this: CheckoutWorld) {
    const context = await browser.createBrowserContext();
    this.page = await context.newPage();
    this.browser = browser;
    await this.page.setViewport({ width: 1200, height: 907 });
    this.page.setDefaultNavigationTimeout(TIMEOUT);
    this.page.setDefaultTimeout(TIMEOUT);
});

After(async function (this: CheckoutWorld, scenario) {
    if (this.page) {
        // Screenshot on failure
        if (scenario.result?.status === 'FAILED') {
            const screenshot = await this.page.screenshot({ encoding: 'base64', fullPage: true });
            this.attach(screenshot, 'image/png');
        }
        const context = this.page.browserContext();
        await this.page.close();
        await context.close();
    }
});

AfterAll(async function () {
    if (browser) {
        await browser.close();
    }
});

