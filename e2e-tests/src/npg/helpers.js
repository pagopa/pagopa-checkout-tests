export const selectKeyboardForm = async () => {
  const selectFormSelector = "[data-testid='KeyboardIcon']";
  const selectFormBtn = await page.waitForSelector(selectFormSelector);
  await selectFormBtn.click();
};

export const fillPaymentNotificationForm = async (noticeCode, fiscalCode) => {
  const noticeCodeTextInput = '#billCode';
  const fiscalCodeTextInput = '#cf';
  const verifyBtn = '#paymentNoticeButtonContinue';

  await selectKeyboardForm();
  await page.waitForSelector(noticeCodeTextInput);
  await page.click(noticeCodeTextInput);
  await page.keyboard.type(noticeCode);

  await page.waitForSelector(fiscalCodeTextInput);
  await page.click(fiscalCodeTextInput);
  await page.keyboard.type(fiscalCode);

  await page.waitForSelector(verifyBtn);
  await page.click(verifyBtn);
};
export const verifyPaymentAndGetError = async (noticeCode, fiscalCode) => {
  const errorMessageSelector = "#verifyPaymentErrorId";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const errorMessageElem = await page.waitForSelector(errorMessageSelector);
  return await errorMessageElem.evaluate((el) => el.textContent);
};

export const verifyPayment = async (noticeCode, fiscalCode) => {
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
};

export const acceptCookiePolicy = async () => {
  const acceptPolicyBtn = '#onetrust-close-btn-container > button';

  await page.waitForSelector(acceptPolicyBtn);
  await page.click(acceptPolicyBtn);
};

export const payNotice = async (noticeCode, fiscalCode, email, cardData, pspId) => {
  console.log(
    `Testing happy path transaction.
    notice code: ${noticeCode},
    fiscal code: ${fiscalCode},
    email: ${email},
    cardData: ${JSON.stringify(cardData)},
    psp id: ${pspId}
    `,
  );
  const payNoticeBtnSelector = '#paymentSummaryButtonPay';
  const resultTitleSelector = "#responsePageMessageTitle";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);

  const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector);
  await payNoticeBtn.click();
  await fillEmailForm(email);
  await choosePaymentMethod('CP');
  await fillCardDataForm(cardData, pspId);
  
  console.log('Wait for the result page to load and get the title, at the end of the transaction (max 120 seconds)...');
  const message = await page.waitForSelector(resultTitleSelector, {
    visible: true,
    timeout: 120000,});
  const messageContent =  await message.evaluate(el => el.textContent)
  console.log(`Message found! ${messageContent}`);
  return messageContent;
};

export const fillEmailForm = async email => {
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
};

export const choosePaymentMethod = async (method) => {
  const cardOptionXPath = `[data-qaid=${method}]`;

  const cardOptionBtn = await page.waitForSelector(cardOptionXPath);
  await cardOptionBtn.click();
};

const execute_mock_authorization_npg = async () => {
  //no-op: NPG authentication phase is automatically performed by mock, no action to be taken
  await page.waitForNavigation();
};

export const fillOnlyCardDataForm = async (cardData) => {
  const cardNumberInput = '#frame_CARD_NUMBER';
  const expirationDateInput = '#frame_EXPIRATION_DATE';
  const ccvInput = '#frame_SECURITY_CODE';
  const holderNameInput = '#frame_CARDHOLDER_NAME';
  const continueBtnXPath = 'button[type=submit]';
  const disabledContinueBtnXPath = 'button[type=submit][disabled=""]';
  let iteration = 0;
  let completed = false;
  while (!completed) {
    iteration++;
    console.log(`Compiling fields...${iteration}`);
    await page.waitForSelector(cardNumberInput, { visible: true });
    await page.click(cardNumberInput, { clickCount: 3 });
    await page.keyboard.type(cardData.number);
    console.log('card number performed');
    await page.waitForSelector(expirationDateInput, { visible: true });
    await page.click(expirationDateInput, { clickCount: 3 });
    await page.keyboard.type(cardData.expirationDate);
    console.log('expiration performed');
    await page.waitForSelector(ccvInput, { visible: true });
    await page.click(ccvInput, { clickCount: 3 });
    await page.keyboard.type(cardData.ccv);
    console.log('cvv performed');
    await page.waitForSelector(holderNameInput, { visible: true });
    await page.click(holderNameInput, { clickCount: 3 });
    await page.keyboard.type(cardData.holderName);
    console.log('holder performed');
    completed = !await page.$(disabledContinueBtnXPath);
    await new Promise(resolve => setTimeout(resolve, 80)); 
  }
  const continueBtn = await page.waitForSelector(continueBtnXPath, { visible: true });
  console.log('continueBtn found');
  await continueBtn.click();

  await page.waitForNavigation();
};

export const fillCardDataForm = async (cardData, pspId) => {
  const cardNumberInput = '#frame_CARD_NUMBER';
  const expirationDateInput = '#frame_EXPIRATION_DATE';
  const ccvInput = '#frame_SECURITY_CODE';
  const holderNameInput = '#frame_CARDHOLDER_NAME';
  const continueBtnXPath = 'button[type=submit]';
  const disabledContinueBtnXPath = 'button[type=submit][disabled=""]';
  const payBtnSelector = '#paymentCheckPageButtonPay';
  const selectPSPRadioBtnXPath = `#${pspId}`;
  let iteration = 0;
  let completed = false;
  while (!completed) {
    iteration++;
    console.log(`Compiling fields...${iteration}`);
    await page.waitForSelector(cardNumberInput, { visible: true });
    await page.click(cardNumberInput, { clickCount: 3 });
    await page.keyboard.type(cardData.number);
    console.log('card number performed');
    await page.waitForSelector(expirationDateInput, { visible: true });
    await page.click(expirationDateInput, { clickCount: 3 });
    await page.keyboard.type(cardData.expirationDate);
    console.log('expiration performed');
    await page.waitForSelector(ccvInput, { visible: true });
    await page.click(ccvInput, { clickCount: 3 });
    await page.keyboard.type(cardData.ccv);
    console.log('cvv performed');
    await page.waitForSelector(holderNameInput, { visible: true });
    await page.click(holderNameInput, { clickCount: 3 });
    await page.keyboard.type(cardData.holderName);
    console.log('holder performed');
    completed = !await page.$(disabledContinueBtnXPath);
    await new Promise(resolve => setTimeout(resolve, 80)); 
  }
  const continueBtn = await page.waitForSelector(continueBtnXPath, { visible: true });
  console.log('continueBtn found');
  await continueBtn.click();

  const selectPSPRadioBtn = await page.waitForSelector(selectPSPRadioBtnXPath, { visible: true });
  console.log('selectPSPRadioBtn found');
  await selectPSPRadioBtn.click();

  const pspContinueBtn = await page.waitForSelector("#paymentPspListPageButtonContinue", {
    visible: true,
  });
  await pspContinueBtn.click(); 

  const payBtn = await page.waitForSelector(payBtnSelector, { visible: true, enabled: true });
  console.log('pay button found');
  await payBtn.click();
  console.log('pay button clicked');
  await page.waitForNavigation();
  await execute_mock_authorization_npg();
};

export const generateRandomNoticeCode = noticeCodePrefix => {
  const validRangeEnd = Number(String(noticeCodePrefix).concat('9999999999999'));
  const validRangeStart = Number(String(noticeCodePrefix).concat('0000000000000'));
  return Math.floor(Math.random() * (validRangeEnd - validRangeStart + 1) + validRangeStart).toString();
};

export const cancelPaymentAction = async () => {
  console.log('cancelPaymentAction');
  //use page.$eval since click doesn't work after animation triggered
  await page.$eval("#paymentCheckPageButtonCancel", el => el.click())
  console.log('paymentCheckPageButtonCancel clicked');
  const cancPayment = await page.waitForSelector("#confirm", {clickable: true, visible: true, enabled: true, timeout: 1000});
  console.log('cancPayment found');
  await cancPayment.click();
  console.log('payment canceled');
  await page.waitForSelector("#redirect-button");
};


