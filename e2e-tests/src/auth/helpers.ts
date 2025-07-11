export const oneIdentityLogin = async (page) => {
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

export const identityProviderMock = async (page) => {
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.waitForSelector('button');
    const icon = await page.$("[data-testid='AccountCircleRoundedIcon']");
    expect(icon).toBeTruthy();
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));