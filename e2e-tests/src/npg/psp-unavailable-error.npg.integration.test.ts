import { choosePaymentMethod, fillEmailForm, fillPaymentNotificationForm } from "./helpers";

/**
 * Test input and configuration
 */
const CHECKOUT_URL = String(process.env.CHECKOUT_URL);
const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
const EMAIL = String(process.env.EMAIL);

/**
 * Increase default test timeout (120000ms)
 * to support entire payment flow
  */

const timeout = 80_000
jest.setTimeout(timeout);
jest.retryTimes(2);
page.setDefaultNavigationTimeout(timeout);
page.setDefaultTimeout(timeout)

beforeAll( async () => {
  await page.goto(CHECKOUT_URL);
  await page.setViewport({ width: 1200, height: 907 });
})

beforeEach(async () => {
  await page.goto(CHECKOUT_URL);
});


describe("Checkout fails to calculate fee", () => {

  it("Should fails calculate fee with 404 and show a dedicated error message", async() => {
   
    // notice code with 6000 euro as amount (according Mock EC)
    const PSP_NOT_FOUND_FAIL = "30212" + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12))
    const pspNotFoundTitleTextExpected = "Il metodo di pagamento selezionato non è disponibile";
    const pspNotFoundCtaTextExpected = "Scegli un altro metodo";
    const errorDescriptionTextExpected = "Può succedere quando l’importo da pagare è particolarmente elevato, o se stai cercando di pagare una marca da bollo digitale.";

    console.log(
      `Testing error message psp unavailable given SATISPAY given amaount of 6000 euro .
      notice code: ${PSP_NOT_FOUND_FAIL},
      fiscal code: ${VALID_FISCAL_CODE}
      `,
    );

    const payNoticeBtnSelector = '#paymentSummaryButtonPay';
    await fillPaymentNotificationForm(PSP_NOT_FOUND_FAIL, VALID_FISCAL_CODE);
  
    const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector);
    await payNoticeBtn.click();
    await fillEmailForm(EMAIL);
    await choosePaymentMethod('BPAY');
    
    const pspNotFoundTitleId = "#pspNotFoundTitleId";
    const pspNotFoundTitleElem = await page.waitForSelector(
      pspNotFoundTitleId
    );
    const pspNotFoundTitleText = await pspNotFoundTitleElem.evaluate((el) => el.textContent);
    expect(pspNotFoundTitleText).toContain(pspNotFoundTitleTextExpected);

    const pspNotFoundCtaId = "#pspNotFoundCtaId";
    const pspNotFoundCtaElem = await page.waitForSelector(pspNotFoundCtaId);
    const pspNotFoundCtaText = await pspNotFoundCtaElem.evaluate((el) => el.textContent);
    expect(pspNotFoundCtaText).toContain(pspNotFoundCtaTextExpected);

    const errorDescriptionId = "#pspNotFoundBodyId";
    const errorDescriptionElem = await page.waitForSelector(errorDescriptionId);
    const errorDescriptionText = await errorDescriptionElem.evaluate((el) => el.textContent);
    expect(errorDescriptionText).toContain(errorDescriptionTextExpected);

  });

});
