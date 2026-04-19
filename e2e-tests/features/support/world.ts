import { World, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import { Browser, Page } from 'puppeteer';

export class CheckoutWorld extends World {
    browser!: Browser;
    page!: Page;
    checkoutUrl: string;

    constructor(options: IWorldOptions) {
        super(options);
        this.checkoutUrl = process.env.CHECKOUT_URL || '';
    }
}

setWorldConstructor(CheckoutWorld);

