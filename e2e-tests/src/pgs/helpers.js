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

export const acceptCookiePolicy = async () => {
  const acceptPolicyBtn = '#onetrust-accept-btn-handler';
  const darkFilterXPath = '/html/body/div[2]/div[1]';

  await page.waitForSelector(acceptPolicyBtn);
  await page.click(acceptPolicyBtn);

  // Avoid click on form button when dark filter is still enabled
  await page.waitForXPath(darkFilterXPath, { hidden: true });
};

export const payNotice = async (noticeCode, fiscalCode, email, cardData, abi, isXpay) => {
  const payNoticeBtnSelector = "#paymentSummaryButtonPay";
  const resultMessageXPath = '/html/body/div[1]/div/div[2]/div/div/div/div/h6';
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector);
  await payNoticeBtn.click();
  await fillEmailForm(email);
  await choosePaymentMethod('card');
  await fillCardDataForm(cardData, abi, isXpay);
  await new Promise((r) => setTimeout(r, 2000));

  const message = await page.waitForXPath(resultMessageXPath);
  return await message.evaluate(el => el.textContent);
};


export const fillEmailForm = async email => {
  const emailInput = '#email';
  const confirmEmailInput = '#confirmEmail';
  const continueBtnSelector = "#paymentEmailPageButtonContinue";

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

const execute_mock_authorization_vpos = async() => {
  const dataInput = '#challengeDataEntry';
  const confirmButton = '#confirm'
  const mockOTPCode = '123456';
  const verificationStep = 2;

  for(let idx =0; idx < verificationStep;  idx++){
    console.log(`executing vpos verification step: ${idx}`);
    await page.waitForSelector(dataInput, {visible: true});
    await page.click(dataInput);
    await page.keyboard.type(mockOTPCode);

    await page.waitForSelector(confirmButton);
    await page.click(confirmButton);
  }
}

const execute_mock_authorization_xpay = async() => {
  const dataInput = '#otipee';
  const confirmButton = 'button[name=btnAction]'
  const mockOTPCode = '123456';
  await page.waitForSelector(dataInput, {visible: true});
  await page.click(dataInput);
  await page.keyboard.type(mockOTPCode);
  await page.waitForSelector(confirmButton);
  await page.click(confirmButton);
  await page.waitForNavigation();
  
}

export const fillCardDataForm = async (cardData, abi, isXpay) => {

  const cardNumberInput = '#number';
  const expirationDateInput = '#expirationDate';
  const ccvInput = '#cvv';
  const holderNameInput = '#name';
  const continueBtnXPath = "button[type=submit]";
  const payBtnSelector = "#paymentCheckPageButtonPay";
  const selectPSPXPath = '/html/body/div[1]/div/div[2]/div/div/div[5]/button';
                          
  
  await page.waitForSelector(cardNumberInput);
  await page.click(cardNumberInput);
  await page.keyboard.type(cardData.number);

  await page.waitForSelector(expirationDateInput);
  await page.click(expirationDateInput);
  await page.keyboard.type(cardData.expirationDate);

  await page.waitForSelector(ccvInput);
  await page.click(ccvInput);
  await page.keyboard.type(cardData.ccv);

  await page.waitForSelector(holderNameInput);
  await page.click(holderNameInput);
  await page.keyboard.type(cardData.holderName);

  const continueBtn = await page.waitForSelector(continueBtnXPath);
  await continueBtn.click();

  const selectPSPBtn = await page.waitForXPath(selectPSPXPath);
  await selectPSPBtn.click();

  const pspButton = `//div[div[div[img[contains(@src, '${abi}')]]]]`
  console.log(pspButton)
  const pspDiv = await page.waitForXPath(pspButton);
  await pspDiv.click();
  
  await page.waitForTimeout(1_000)
  const payBtn = await page.waitForSelector(payBtnSelector);
  await payBtn.click();
  await page.waitForNavigation();
  if(isXpay){
    await execute_mock_authorization_xpay();
  } else{
    await execute_mock_authorization_vpos();
  }
  

};
