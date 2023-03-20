import {
  VALID_RANGE_END_NOTICE_CODE,
  VALID_RANGE_START_NOTICE_CODE,
  BILL_CODE_ID,
  CF_ID,
  EMAIL_ID,
  CHECK_EMAIL_ID,
  VERIFY_BUTTON_ID,
  ACCEPT_POLICY_BUTTON_ID,
  PAYMENT_SUMMARY_BUTTON_ID,
  CONTINUE_BUTTON_ID,
  CARD_NUMBER_INPUT,
  EXPIRATION_DATE_INPUT,
  CCV_INPUT,
  HOLDER_NAME_INPUT,
  CONTINUE_PAYMENT_BUTTON,
} from '../utils/const';

export const generateAValidNoticeCode = () =>
  Math.floor(
    Math.random() * (VALID_RANGE_END_NOTICE_CODE - VALID_RANGE_START_NOTICE_CODE + 1) + VALID_RANGE_START_NOTICE_CODE,
  ).toString();

export const fillInputById = async (id, value) => {
  await page.waitForSelector(id);
  await page.click(id);
  await page.keyboard.type(value);
};

export const clearInputById = async id => {
  const actualValue = await page.$eval(id, ({ value }) => value);
  await page.click(id);
  const promises = [...actualValue].map(() => page.keyboard.press('Backspace'));
  await Promise.all(promises);
};

export const fillPaymentNotificationForm = async (noticeCode, fiscalCode) => {
  await fillInputById(BILL_CODE_ID, noticeCode);
  await fillInputById(CF_ID, fiscalCode);
};

export const confirmPaymentNotificationForm = async () => {
  await page.waitForSelector(VERIFY_BUTTON_ID);
  await page.click(VERIFY_BUTTON_ID);
};

export const verifyPaymentAndGetError = async (noticeCode, fiscalCode) => {
  const errorMessageXPath = '/html/body/div[3]/div[3]/div/div/div[2]/div[2]/div';
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  await confirmPaymentNotificationForm();
  const errorMessageElem = await page.waitForXPath(errorMessageXPath);
  return await errorMessageElem.evaluate(el => el.textContent);
};

export const verifyPayment = async (noticeCode, fiscalCode) => {
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  await confirmPaymentNotificationForm();
};

export const acceptCookiePolicy = async () => {
  const darkFilterXPath = '/html/body/div[2]/div[1]';

  await page.waitForSelector(ACCEPT_POLICY_BUTTON_ID);
  await page.click(ACCEPT_POLICY_BUTTON_ID);

  // Avoid click on form button when dark filter is still enabled
  await page.waitForXPath(darkFilterXPath, { hidden: true });
};

export const confirmSummary = async () => {
  const payNoticeBtn = await page.waitForSelector(PAYMENT_SUMMARY_BUTTON_ID);
  await payNoticeBtn.click();
};

export const payNotice = async (noticeCode, fiscalCode, email, cardData) => {
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  await confirmPaymentNotificationForm();
  await confirmSummary();
  await fillEmailForm(email);
  await confirmEmailForm();
  await choosePaymentMethod('card');
  await fillCardDataForm(cardData);
  await new Promise(r => setTimeout(r, 2000));

  const resultMessageXPath = '/html/body/div[1]/div/div[2]/div/div/div/div/h6';
  const message = await page.waitForXPath(resultMessageXPath);
  return await message.evaluate(el => el.textContent);
};

export const payNoticeXPay = async (noticeCode, fiscalCode, email, cardData) => {
  const payNoticeBtnXPath = '/html/body/div[1]/div/div[2]/div/div[6]/div[1]/button';
  const resultMessageXPath = '/html/body/div[1]/div/div[2]/div/div/div/div/h6';
  await fillPaymentNotificationForm(noticeCode, fiscalCode);

  const payNoticeBtn = await page.waitForXPath(payNoticeBtnXPath);
  await payNoticeBtn.click();
  await page.waitForNavigation();

  await fillEmailForm(email);
  await confirmEmailForm();
  await choosePaymentMethod('card');
  await fillCardDataForm(cardData, true);

  const message = await page.waitForXPath(resultMessageXPath);
  return await message.evaluate(el => el.textContent);
};

export const fillEmailForm = async (email, email2) => {
  await fillInputById(EMAIL_ID, email);
  await fillInputById(CHECK_EMAIL_ID, email2 || email);
};

export const confirmEmailForm = async () => {
  const continueBtn = await page.waitForSelector(CONTINUE_BUTTON_ID);
  await continueBtn.click();
};

export const choosePaymentMethod = async method => {
  const cardOptionXPath = '/html/body/div[1]/div/div[2]/div/div[2]/div/div[1]/div[1]/div';

  switch (method) {
    case 'card': {
      const cardOptionBtn = await page.waitForXPath(cardOptionXPath);
      await cardOptionBtn.click();
      break;
    }
  }
};

const execute_mock_authorization = async () => {
  const dataInput = '#challengeDataEntry';
  const confirmButton = '#confirm';
  const mockOTPCode = '123456';
  const verificationStep = 2;

  for (let _ = 0; _ < verificationStep; _++) {
    await page.waitForSelector(dataInput, { visible: true });
    await page.click(dataInput);
    await page.keyboard.type(mockOTPCode);

    await page.waitForSelector(confirmButton);
    await page.click(confirmButton);

    await page.waitForNavigation();
  }
};

export const fillCardDataForm = async cardData => {
  const { number, expirationDate, cvv, holderName } = cardData;

  const unauthorizedCard = '4801769871971639';

  const payBtnSelector = '#paymentCheckPageButtonPay';

  await fillInputById(CARD_NUMBER_INPUT, number);
  await fillInputById(EXPIRATION_DATE_INPUT, expirationDate);
  await fillInputById(CCV_INPUT, cvv);
  await fillInputById(HOLDER_NAME_INPUT, holderName);

  const continueBtn = await page.waitForSelector(CONTINUE_PAYMENT_BUTTON);
  await continueBtn.click();

  const payBtn = await page.waitForSelector(payBtnSelector);
  await payBtn.click();

  if (unauthorizedCard !== cardData.number) {
    await page.waitForNavigation();
    await execute_mock_authorization();
  }
};

export const isButtonDisabled = async id => await page.$eval(id, ({ disabled }) => disabled);
