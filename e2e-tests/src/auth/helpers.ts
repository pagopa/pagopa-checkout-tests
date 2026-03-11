export const oneIdentityLogin = async (page) => {
    await page.waitForSelector('#spidButton', { visible: true });
    await page.click("#spidButton");

    await page.evaluate(() => {
        document.getElementById('https://idp.uat.oneid.pagopa.it').click()
    })


    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.waitForSelector('form#login-form');

    await page.type('#username', 'oneidentity');
    await page.type('#password', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForSelector('form#consent-form', { visible: true });
    await page.click('form#consent-form input[type="submit"][value="true"]');//*[@id="consent-form"]/div[2]/button[2]

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.waitForSelector('button');
    const icon = await page.$("[data-testid='AccountCircleRoundedIcon']");
    expect(icon).toBeTruthy();
}

export const identityProviderMock = async (page) => {
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.waitForSelector('button');
    const icon = await page.$("[data-testid='AccountCircleRoundedIcon']");
    expect(icon).toBeTruthy();
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));