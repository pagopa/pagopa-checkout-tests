import { ElementHandle } from "puppeteer";
import { fillPaymentNotificationForm, selectLanguage } from "../npg/helpers"
import { NAV_PAA_PAGAMENTO_DUPLICATO, TEST_CASES, VALID_FISCAL_CODE } from "./constants";
import { Category, CodeCategory, Language, TestCase } from "./types";

export const  verifyActivatePaymentTest = () => {
    for(let language of Object.values(Language)){
        
        TEST_CASES.filter(t => !t.skipTest)
            .forEach( testCase => {
                const noticeCode = generateRandomNoticeCode(testCase.category);
                it(`Should throw ${testCase.category.codeCategory} {
                    notice code: ${noticeCode},
                    fiscal code: ${VALID_FISCAL_CODE},
                    language: ${language}
                }}`, async () => {await selectLanguage(language);await runErrorModalTest(testCase, noticeCode, language)})
            });
    }
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
export async function runErrorModalTest(testCase: TestCase, noticeCode: string, language: string) {
    
    // Loop for every language
    
        console.log(
            `Testing error case ${testCase.category.codeCategory}.
            notice code: ${noticeCode},
            fiscal code: ${VALID_FISCAL_CODE},
            language: ${language}
            `);

        await fillPaymentNotificationForm(noticeCode, VALID_FISCAL_CODE);
        // Gets the messages from the modal.
        const messageHeader = testCase?.header?.xpath && await page.waitForXPath(testCase?.header?.xpath);
        const messageBody = testCase.body?.xpath && await page.waitForXPath(testCase.body?.xpath);
        const messageErrorCode = testCase.errorCodeXpath && await page.waitForXPath(testCase.errorCodeXpath);

        // Compare the modal messages with the expected ones.
        messageHeader && expect(await messageHeader.evaluate(el => el.textContent)).toContain(testCase?.header?.message.find(m => m.language === language)?.value);
        messageBody && expect(await messageBody.evaluate(el => el.textContent)).toContain(testCase?.body?.message.find(m => m.language === language)?.value);
        (testCase?.errorCodeXpath && messageErrorCode) && 
            expect(await messageErrorCode.evaluate(el => el.textContent)).toContain(testCase.category.codeCategory);
}