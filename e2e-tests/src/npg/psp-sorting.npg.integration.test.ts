import { choosePaymentMethod, fillEmailForm, fillOnlyCardDataForm, fillPaymentNotificationForm } from "./helpers";
import { selectLanguage } from "../verify/helpers";

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
  await selectLanguage("it");
});


describe("Checkout show and sort psp list", () => {

  it("Should show psp sorted list by fee", async() => {
   
    // notice code with 6000 euro as amount (according Mock EC)
    const CODICE_AVVISO = "30202" + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12))

    console.log(
      `Testing psp list is sorted .
      notice code: ${CODICE_AVVISO},
      fiscal code: ${VALID_FISCAL_CODE}
      `,
    );

    const payNoticeBtnSelector = '#paymentSummaryButtonPay';
    const pspEditButtonSelector = "#pspEdit";
    const pspFeeSortButtonId = "#sortByFee";

    await fillPaymentNotificationForm(CODICE_AVVISO, VALID_FISCAL_CODE);
    const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector);
    await payNoticeBtn.click();
    await fillEmailForm(EMAIL);
    await choosePaymentMethod('CP');
    await fillOnlyCardDataForm({
      number: "4242424242424242",
      expirationDate: "1230",
      ccv: "123",
      holderName: "Test test"
    })
    const pspEditButton = await page.waitForSelector(pspEditButtonSelector);
    await pspEditButton.click();
    await new Promise(r => setTimeout(r, 1000));
    const pspOriginalElements = await page.$$(".pspFeeValue");
    const originalPspFeeLisValues = await Promise.all(
      Array.from(pspOriginalElements).map(async (element) => {
        const text = await element.evaluate((el) => el.textContent);
        // We want to skip the Dollar, Euro, or any currency placeholder
        let numbers = text.match(/[\d,]+/g); // This will match sequences of digits and commas
        let result = numbers ? numbers.join("").replace(",",".") : ""; // Join the matched numbers if any and replace , as separator with .
        return parseFloat(result) || 0; // Convert to number, default to 0 if NaN
      })
    );

    expect(Array.isArray(originalPspFeeLisValues)).toBe(true);
    expect(originalPspFeeLisValues.length > 0).toBe(true);
    for (let i = 0; i < originalPspFeeLisValues.length - 1; i++) {
      expect(originalPspFeeLisValues[i]).toBeLessThanOrEqual(originalPspFeeLisValues[i + 1]);
    }

    const pspFeeSortButton = await page.waitForSelector(pspFeeSortButtonId);
    await pspFeeSortButton.click();
    await new Promise(r => setTimeout(r, 1000));
    // Wait for the elements and get the list of divs
    const pspSortedElements = await page.$$(".pspFeeValue");
    // Extract numeric content from each div and return as an array
    const decreasingPspFeeListValues = await Promise.all(
      Array.from(pspSortedElements).map(async (element) => {
        const text = await element.evaluate((el) => el.textContent);
        // We want to skip the Dollar, Euro, or any currency placeholder
        let numbers = text.match(/[\d,]+/g); // This will match sequences of digits and commas
        let result = numbers ? numbers.join("").replace(",",".") : ""; // Join the matched numbers if any and replace , as separator with .
        return parseFloat(result) || 0; // Convert to number, default to 0 if NaN
      })
    );

    expect(Array.isArray(decreasingPspFeeListValues)).toBe(true);
    expect(decreasingPspFeeListValues.length > 0).toBe(true);
    for (let i = 0; i < decreasingPspFeeListValues.length - 1; i++) {
      expect(decreasingPspFeeListValues[i]).toBeGreaterThanOrEqual(decreasingPspFeeListValues[i + 1]);
    }

  });


  
  it("Should show psp sorted list by Name", async() => {
   
    // notice code with 6000 euro as amount (according Mock EC)
    const CODICE_AVVISO = "30202" + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12))

    console.log(
      `Testing psp list is sorted .
      notice code: ${CODICE_AVVISO},
      fiscal code: ${VALID_FISCAL_CODE}
      `,
    );

    const payNoticeBtnSelector = '#paymentSummaryButtonPay';
    const pspEditButtonSelector = "#pspEdit";
    const pspNameSortButtonId = "#sortByName";

    await fillPaymentNotificationForm(CODICE_AVVISO, VALID_FISCAL_CODE);
    const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector);
    await payNoticeBtn.click();
    await fillEmailForm(EMAIL);
    await choosePaymentMethod('CP');
    await fillOnlyCardDataForm({
      number: "4242424242424242",
      expirationDate: "1230",
      ccv: "123",
      holderName: "Test test"
    })
    const pspEditButton = await page.waitForSelector(pspEditButtonSelector);
    await pspEditButton.click();
    await new Promise(r => setTimeout(r, 1000));
    const pspOriginalElements = await page.$$(".pspFeeValue");
    const originalPspFeeLisValues = await Promise.all(
      Array.from(pspOriginalElements).map(async (element) => {
        const text = await element.evaluate((el) => el.textContent);
        // We want to skip the Dollar, Euro, or any currency placeholder
        let numbers = text.match(/[\d,]+/g); // This will match sequences of digits and commas
        let result = numbers ? numbers.join("").replace(",",".") : ""; // Join the matched numbers if any and replace , as separator with .
        return parseFloat(result) || 0; // Convert to number, default to 0 if NaN
      })
    );

    expect(Array.isArray(originalPspFeeLisValues)).toBe(true);
    expect(originalPspFeeLisValues.length > 0).toBe(true);
    for (let i = 0; i < originalPspFeeLisValues.length - 1; i++) {
      expect(originalPspFeeLisValues[i]).toBeLessThanOrEqual(originalPspFeeLisValues[i + 1]);
    }

    const pspNameSortButton = await page.waitForSelector(pspNameSortButtonId);
    await pspNameSortButton.click();
    await new Promise(r => setTimeout(r, 1000));
    // Wait for the elements and get the list of divs
    const pspSortedElements = await page.$$(".pspFeeValue");
    // Extract numeric content from each div and return as an array
    const decreasingPspFeeListValues = await Promise.all(
      Array.from(pspSortedElements).map(async (element) => {
        const text = await element.evaluate((el) => el.textContent);
        // We want to skip the Dollar, Euro, or any currency placeholder
        let numbers = text.match(/[\d,]+/g); // This will match sequences of digits and commas
        let result = numbers ? numbers.join("").replace(",",".") : ""; // Join the matched numbers if any and replace , as separator with .
        return parseFloat(result) || 0; // Convert to number, default to 0 if NaN
      })
    );

    expect(Array.isArray(decreasingPspFeeListValues)).toBe(true);
    expect(decreasingPspFeeListValues.length > 0).toBe(true);
    for (let i = 0; i < decreasingPspFeeListValues.length - 1; i++) {
      expect(decreasingPspFeeListValues[i]).toBeGreaterThanOrEqual(decreasingPspFeeListValues[i + 1]);
    }

  });
});
