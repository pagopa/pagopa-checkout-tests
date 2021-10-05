import { Cluster } from 'puppeteer-cluster';

require('events').EventEmitter.defaultMaxListeners = 100;

describe('Load test', () => {

    const IO_PAY_PORTAL_URL = process.env.IO_PAY_PORTAL_URL;
    const NOTICE_CODE = process.env.VALID_NOTICE_CODE;
    const FISCAL_CODE_PA = process.env.VALID_FISCAL_CODE_PA;
    const MAX_CONCURRENCY = process.env.MAX_CONCURRENCY;
    const MAX_VIRTUAL_USER = process.env.MAX_VIRTUAL_USER;

    jest.setTimeout(480000);

    async function verifyPayment(concurrencyType) {
        const cluster = await Cluster.launch({
            puppeteerOptions: { headless: true, args: ['--no-sandbox'] },
            maxConcurrency: parseInt(MAX_CONCURRENCY),
            concurrency: concurrencyType,
        });

 
        cluster.task(async ({ page, data: url }) => {

            await page.goto(url);

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
        });

        for(let i=0; i<MAX_VIRTUAL_USER; i++){
            cluster.queue(IO_PAY_PORTAL_URL)
        }

        await cluster.idle();
        await cluster.close();
    }

    test('Verify payments', async () => {
        await verifyPayment(Cluster.CONCURRENCY_BROWSER);
    });
});
