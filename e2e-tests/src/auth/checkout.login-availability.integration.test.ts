import { selectLanguage } from "../verify/helpers";
import { generateRandomNoticeCode } from "../npg/helpers";

describe("Checkout Login Availability During Payment Flow", () => {

    const CHECKOUT_URL = String(process.env.CHECKOUT_URL);
    const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
    const EMAIL = String(process.env.EMAIL);

    const timeout = 80_000;
    jest.setTimeout(timeout);
    jest.retryTimes(2);
    page.setDefaultNavigationTimeout(timeout);
    page.setDefaultTimeout(timeout);

    beforeAll(async () => {
        await page.goto(CHECKOUT_URL);
        await page.setViewport({ width: 1200, height: 907 });
    });

    beforeEach(async () => {
        await page.goto(CHECKOUT_URL);
        await selectLanguage("it");
    })


    const enterInNoticeData = async () => {
        const noticeCodeTextInput = '#billCode';
        const selectFormSelector = "[data-testid='KeyboardIcon']";
        const selectFormBtn = await page.waitForSelector(selectFormSelector);
        await selectFormBtn.click();
        await page.waitForSelector(noticeCodeTextInput);
        await page.click(noticeCodeTextInput);
    }

    const enterInDataPayment = async () => {
        const noticeCode = generateRandomNoticeCode('30201');
        const fiscalCode = VALID_FISCAL_CODE;
        const fiscalCodeTextInput = '#cf';
        const verifyBtn = '#paymentNoticeButtonContinue';

        await page.keyboard.type(noticeCode);
        await page.waitForSelector(fiscalCodeTextInput);
        await page.click(fiscalCodeTextInput);
        await page.keyboard.type(fiscalCode);

        await page.waitForSelector(verifyBtn);
        await page.click(verifyBtn);
    }

    const enterInEmail = async () => {
        const payNoticeBtnSelector = '#paymentSummaryButtonPay';
        const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector);
        await payNoticeBtn.click();
    }

    const enterInSelectMethod = async () => {
        const email = EMAIL;
        const emailInput = '#email';
        const confirmEmailInput = '#confirmEmail';
        const continueBtnSelector = '#paymentEmailPageButtonContinue';

        await page.waitForSelector(emailInput);
        await page.click(emailInput);
        await page.keyboard.type(email);

        await page.waitForSelector(confirmEmailInput);
        await page.click(confirmEmailInput);
        await page.keyboard.type(email);

        const continueBtn = await page.waitForSelector(continueBtnSelector);
        await continueBtn.click();
    }

    const login = async () => {
        await page.waitForSelector('#login-header button');
        await page.locator('#login-header button').click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.waitForSelector('button');
    };

    it("Should show login option when entering notice data", async () => {
        await enterInNoticeData();
        /*
        await login();
        const button = await page.$x("//button[contains(., 'NomeTest CognomeTest')]");
        expect(button.length).toBeGreaterThan(0);
        */
        await page.waitForSelector('#login-header button');
        const loginButton = await page.$('#login-header button');
        expect(loginButton).not.toBeNull();
        const buttonTitle = await page.evaluate(button => button.getAttribute('title'), loginButton);
        expect(buttonTitle).toBe('Accedi');
    });

    it("Should show login option after entering Payment Data", async () => {
        await enterInNoticeData();
        await enterInDataPayment();

        await page.waitForSelector('#login-header button');
        const loginButton = await page.$('#login-header button');
        expect(loginButton).not.toBeNull();
        const buttonTitle = await page.evaluate(button => button.getAttribute('title'), loginButton);
        expect(buttonTitle).toBe('Accedi');
    });

    it("Should show login option after entering email", async () => {
        await enterInNoticeData();
        await enterInDataPayment();
        await enterInEmail();

        await page.waitForSelector('#login-header button');
        const loginButton = await page.$('#login-header button');
        expect(loginButton).not.toBeNull();
        const buttonTitle = await page.evaluate(button => button.getAttribute('title'), loginButton);
        expect(buttonTitle).toBe('Accedi');
    });

    it("Should show login option after selecting payment method", async () => {
        await enterInNoticeData();
        await enterInDataPayment();
        await enterInEmail();
        await enterInSelectMethod();

        await page.waitForSelector('#login-header button');
        const loginButton = await page.$('#login-header button');
        expect(loginButton).not.toBeNull();
        const buttonTitle = await page.evaluate(button => button.getAttribute('title'), loginButton);
        expect(buttonTitle).toBe('Accedi');
    });
});
