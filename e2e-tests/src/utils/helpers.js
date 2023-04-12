import fetch from 'node-fetch';
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
  CVV_INPUT,
  HOLDER_NAME_INPUT,
  CONTINUE_PAYMENT_BUTTON,
} from '../utils/const';

export const generateAValidNoticeCode = () =>
  Math.floor(
    Math.random() * (VALID_RANGE_END_NOTICE_CODE - VALID_RANGE_START_NOTICE_CODE + 1) + VALID_RANGE_START_NOTICE_CODE,
  ).toString();

export const selectKeyboardInput = async () => {
  const selectFormXPath = '/html/body/div[1]/div/div[2]/div/div[2]/div[2]/div[1]/div/div/div[1]';

  const selectFormBtn = await page.waitForXPath(selectFormXPath);
  await selectFormBtn.click();
};

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

export const payNotice = async (noticeCode, fiscalCode, email, cardData, psp) => {
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  await confirmPaymentNotificationForm();
  await confirmSummary();
  await fillEmailForm(email);
  await confirmEmailForm();
  await choosePaymentMethod('card');
  await fillCardDataForm(cardData, psp);
  await new Promise(r => setTimeout(r, 2000));

  const resultMessageXPath = '/html/body/div[1]/div/div[2]/div/div/div/div/h6';
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
  try {
    const dataInput = '#otipee';
    const confirmButton =
      '#returnForm > div.row.rowDataProps.row-eq-height.white > div.col-xs-6.spaziaturaData.padData.noVerticalPad.noPadXS > button';
    const mockOTPCode = '123456';

    await fillInputById(dataInput, mockOTPCode);
    await page.waitForSelector(confirmButton);
    await page.click(confirmButton);
    await page.waitForNavigation();

    const localStorage = await page.evaluate(() => sessionStorage.getItem('transaction'));
    const token = JSON.parse(localStorage).payments[0].paymentToken;
    await fetch('https://api.dev.platform.pagopa.it/nodo/node-for-psp/v1', {
      method: 'POST',
      headers: {
        Host: 'api.dev.platform.pagopa.it:443',
        'Content-Type': 'application/xml',
        SOAPAction: 'sendPaymentOutcome',
      },
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nod="http://pagopa-api.pagopa.gov.it/node/nodeForPsp.xsd">\n    <soapenv:Header/>\n    <soapenv:Body>\n        <nod:sendPaymentOutcomeReq>\n            <idPSP>60000000001</idPSP>\n            <idBrokerPSP>60000000001</idBrokerPSP>\n            <idChannel>60000000001_01</idChannel>\n            <password>pwdpwdpwd</password>\n            <paymentToken>${token}</paymentToken>\n            <outcome>OK</outcome>\n            <!--Optional:-->\n            <details>\n                <paymentMethod>creditCard</paymentMethod>\n                <!--Optional:-->\n                <paymentChannel>app</paymentChannel>\n                <fee>5.00</fee>\n                <!--Optional:-->\n                <payer>\n                    <uniqueIdentifier>\n                        <entityUniqueIdentifierType>G</entityUniqueIdentifierType>\n                        <entityUniqueIdentifierValue>77777777777_01</entityUniqueIdentifierValue>\n                    </uniqueIdentifier>\n                    <fullName>name</fullName>\n                    <!--Optional:-->\n                    <streetName>street</streetName>\n                    <!--Optional:-->\n                    <civicNumber>civic</civicNumber>\n                    <!--Optional:-->\n                    <postalCode>postal</postalCode>\n                    <!--Optional:-->\n                    <city>city</city>\n                    <!--Optional:-->\n                    <stateProvinceRegion>state</stateProvinceRegion>\n                    <!--Optional:-->\n                    <country>IT</country>\n                    <!--Optional:-->\n                    <e-mail>prova@test.it</e-mail>\n                </payer>\n                <applicationDate>2021-12-12</applicationDate>\n                <transferDate>2021-12-11</transferDate>\n            </details>\n        </nod:sendPaymentOutcomeReq>\n    </soapenv:Body>\n</soapenv:Envelope>`,
    });
  } catch (e) {
    console.error(e);
  }
};

const selectPsp = async psp => {
  try {
    const ModificaPSP = await page.waitForSelector("button[aria-label='Modifica PSP']");
    await ModificaPSP.click();
    const PSPs = await page.$x(`//div[contains(text(), '${psp}')]`);
    if (PSPs.length === 1) await PSPs[0].click();
  } catch (e) {
    console.error(e);
  }
};

export const fillCardDataForm = async (cardData, psp) => {
  const { number, expirationDate, cvv, holderName } = cardData;

  const unauthorizedCard = '4801769871971639';

  const payBtnSelector = '#paymentCheckPageButtonPay';

  await fillInputById(CARD_NUMBER_INPUT, number);
  await fillInputById(EXPIRATION_DATE_INPUT, expirationDate);
  await fillInputById(CVV_INPUT, cvv);
  await fillInputById(HOLDER_NAME_INPUT, holderName);

  const continueBtn = await page.waitForSelector(CONTINUE_PAYMENT_BUTTON);
  await continueBtn.click();

  if (psp) await selectPsp(psp);

  const payBtn = await page.waitForSelector(payBtnSelector);
  await payBtn.click();

  if (unauthorizedCard !== cardData.number) {
    await page.waitForNavigation();
    await execute_mock_authorization();
  }
};

export const isButtonDisabled = async id => await page.$eval(id, ({ disabled }) => disabled);
