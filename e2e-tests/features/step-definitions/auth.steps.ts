import { Given, When, Then } from '@cucumber/cucumber';
import { CheckoutWorld } from '../support/world';
import { oneIdentityLogin, identityProviderMock, sleep } from '../../src/auth/helpers';

// ─── Background steps ───

Given('the user is on the Checkout homepage', async function (this: CheckoutWorld) {
    await this.page.goto(this.checkoutUrl);
});

Given('the language is set to {string}', async function (this: CheckoutWorld, lang: string) {
    await this.page.waitForSelector('#languageMenu', { timeout: 10_000 });
    await this.page.select('#languageMenu', lang);
});

// ─── Login steps ───

When('the user starts the login process', async function (this: CheckoutWorld) {
    await this.page.waitForSelector('#login-header button');
    await this.page.locator('#login-header button').click();
});

When('the user authenticates with the SPID identity provider', async function (this: CheckoutWorld) {
    if (this.checkoutUrl.includes('uat')) {
        await oneIdentityLogin(this.page);
    } else {
        await identityProviderMock(this.page);
    }
});

Then('the user should be logged in successfully', async function (this: CheckoutWorld) {
    await this.page.waitForSelector('button');
    const icon = await this.page.$("[data-testid='AccountCircleRoundedIcon']");
    expect(icon).toBeTruthy();
});

// ─── Logout steps ───

Given('the user is authenticated via SPID', async function (this: CheckoutWorld) {
    // Reuse login as a precondition
    await this.page.waitForSelector('#login-header button');
    await this.page.locator('#login-header button').click();
    if (this.checkoutUrl.includes('uat')) {
        await oneIdentityLogin(this.page);
    } else {
        await identityProviderMock(this.page);
    }
    await this.page.waitForSelector('button');
});

When('the user requests to logout', async function (this: CheckoutWorld) {
    await this.page.evaluate(() => {
        const buttons = document.getElementsByTagName('button');
        buttons[0].click();
        const lis = document.getElementsByTagName('li');
        lis[0].click();
    });
});

When('the user confirms the logout', async function (this: CheckoutWorld) {
    const confirmButton = await this.page.waitForSelector('#logoutModalConfirmButton');
    await confirmButton!.click();
    await sleep(500);
});

Then('the user should be logged out', async function (this: CheckoutWorld) {
    // Verified by login button being visible (next step)
});

Then('the login button should be visible', async function (this: CheckoutWorld) {
    const button = await this.page.waitForSelector('#login-header button', { visible: true });
    expect(button).not.toBeNull();
});

