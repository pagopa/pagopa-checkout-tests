import { fillPaymentNotificationForm } from "../npg/helpers"
import { NAV_PAA_PAGAMENTO_DUPLICATO, TEST_CASES, VALID_FISCAL_CODE } from "./constants";
import { Category, CodeCategory, TestCase } from "./types";

export const  verifyActivatePaymentTest = () => {
    TEST_CASES.filter(t => !t.skipTest)
        .forEach( testCase => {
            const noticeCode = generateRandomNoticeCode(testCase.category);
            it(`Should throw ${testCase.category.codeCategory} {
                notice code: ${noticeCode},
                fiscal code: ${VALID_FISCAL_CODE}
            }}`, async () => {await runErrorModalTest(testCase, noticeCode)})
        });
};

/**
* Based on the type of test case category, a specific noticeCode is generated for that case.
*/
export const generateRandomNoticeCode = (category: Category) => {
    const { codeCategory, rangeEnd, rangeStart } = category;

    return codeCategory === CodeCategory.PAA_PAGAMENTO_DUPLICATO
        ? NAV_PAA_PAGAMENTO_DUPLICATO
        : Math.floor(Math.random() * (rangeEnd - rangeStart + 1) + rangeStart).toString();
};

/**
* Execute the steps to generate the error modal.
*/
export async function runErrorModalTest(testCase: TestCase, noticeCode:string) {
    
    console.log(
      `Testing error case ${testCase.category.codeCategory}.
      notice code: ${noticeCode},
      fiscal code: ${VALID_FISCAL_CODE}
      `);
      
    await fillPaymentNotificationForm(noticeCode, VALID_FISCAL_CODE);

    // Gets the messages from the modal.
    const messageHeader = testCase?.header?.selector && await page.waitForSelector(testCase?.header?.selector);
    const messageBody = testCase.body?.selector && await page.waitForSelector(testCase.body?.selector);
    const messageErrorCode = testCase.errorCodeXpath && await page.waitForXPath(testCase.errorCodeXpath);

    // Compare the modal messages with the expected ones.
    messageHeader && expect(await messageHeader.evaluate(el => el.textContent)).toContain(testCase?.header?.message);
    messageBody && expect(await messageBody.evaluate(el => el.textContent)).toContain(testCase?.body?.message);
    (testCase?.errorCodeXpath && messageErrorCode) && 
        expect(await messageErrorCode.evaluate(el => el.textContent)).toContain(testCase.category.codeCategory);  
}
/**
* Select desired language
*/
export const selectLanguage = async (language) => {
    await page.select('#languageMenu', language)
}