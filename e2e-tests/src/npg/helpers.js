export const selectKeyboardForm = async () => {
  const selectFormXPath = '/html/body/div[1]/div/div[2]/div/div[2]/div[2]/div[1]/div/div/div[1]';

  const selectFormBtn = await page.waitForXPath(selectFormXPath);
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
  const errorMessageXPath = '/html/body/div[3]/div[3]/div/div/div[2]/div[2]/div';
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const errorMessageElem = await page.waitForXPath(errorMessageXPath);
  return await errorMessageElem.evaluate(el => el.textContent);
};

export const verifyPayment = async (noticeCode, fiscalCode) => {
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
};

export const payNotice = async (noticeCode, fiscalCode, email, cardData, abi) => {
  console.log(
    `Testing happy path transaction.
    notice code: ${noticeCode},
    fiscal code: ${fiscalCode},
    email: ${email},
    cardData: ${JSON.stringify(cardData)}
    psp abi: ${abi}
    `,
  );
  const payNoticeBtnSelector = '#paymentSummaryButtonPay';
  const resultMessageXPath = '/html/body/div[1]/div/div[2]/div/div/div/div/h6';
  await fillPaymentNotificationForm(noticeCode, fiscalCode);

  const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector);
  await payNoticeBtn.click();
  await fillEmailForm(email);
  await choosePaymentMethod('card');
  await fillCardDataForm(cardData, abi);

  const message = await page.waitForXPath(resultMessageXPath);
  return await message.evaluate(el => el.textContent);
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

const execute_mock_authorization_npg = async () => {
  //no-op: NPG authentication phase is automatically performed by mock, no action to be taken
  await page.waitForNavigation();
};

export const fillCardDataForm = async (cardData, abi) => {
  const cardNumberInput = '#frame_CARD_NUMBER';
  const expirationDateInput = '#frame_EXPIRATION_DATE';
  const ccvInput = '#frame_SECURITY_CODE';
  const holderNameInput = '#frame_CARDHOLDER_NAME';
  const continueBtnXPath = 'button[type=submit]';
  const disabledContinueBtnXPath = 'button[type=submit][disabled=""]';
  const payBtnSelector = '#paymentCheckPageButtonPay';
  const selectPSPXPath = '/html/body/div[1]/div/div[2]/div/div/div[5]/button';
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
    completed = !!!(await page.$(disabledContinueBtnXPath));
    await page.waitForTimeout(1_000);
  }
  const continueBtn = await page.waitForSelector(continueBtnXPath, { visible: true });
  await continueBtn.click();

  const selectPSPBtn = await page.waitForXPath(selectPSPXPath);
  await selectPSPBtn.click();

  const pspButton = `//div[div[div[img[contains(@src, '${abi}')]]]]`;
  const pspDiv = await page.waitForXPath(pspButton);
  await pspDiv.click();

  await page.waitForTimeout(1_000);
  const payBtn = await page.waitForSelector(payBtnSelector, { visible: true });
  await payBtn.click();
  await page.waitForNavigation();
  await execute_mock_authorization_npg();
};

export const generateRandomNoticeCode = noticeCodePrefix => {
  const validRangeEnd = Number(String(noticeCodePrefix).concat('9999999999999'));
  const validRangeStart = Number(String(noticeCodePrefix).concat('0000000000000'));
  return Math.floor(Math.random() * (validRangeEnd - validRangeStart + 1) + validRangeStart).toString();
};
