const puppeteer = require('puppeteer');

const IO_PAY_PORTAL_URL = process.env.IO_PAY_PORTAL_URL;
const NOTICE_CODE = process.env.VALID_NOTICE_CODE;
const FISCAL_CODE_PA = process.env.VALID_FISCAL_CODE_PA;

(async () => {
    // Set up browser and page.
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
      });
      const page = await browser.newPage();


    await page.goto(IO_PAY_PORTAL_URL);
    await page.setViewport({ width: 1200, height: 907 });

    const noticeCodeTextInput = '#paymentNoticeCode';
    await page.waitForSelector(noticeCodeTextInput);
    await page.click(noticeCodeTextInput);
    await page.keyboard.type(NOTICE_CODE);
          
    const fiscalCodePaTextInput = '#organizationId';
    await page.waitForSelector(fiscalCodePaTextInput);
    await page.click(fiscalCodePaTextInput);
    await page.keyboard.type(FISCAL_CODE_PA);
          
    const verifyButton = '#verify';
    await page.waitForSelector(verifyButton);
    await page.click(verifyButton);

    await page.waitForResponse(response => response.request().method() === 'GET' && /payment-requests/.test(response.request().url()));

    browser.close();

})();

