export const activatePayment = async (validNoticeCode, validFiscalCodePa) => {
  const noticeCodeTextInput = '#paymentNoticeCode';
  await page.waitForSelector(noticeCodeTextInput);
  await page.click(noticeCodeTextInput);
  await page.keyboard.type(validNoticeCode);

  const fiscalCodePaTextInput = '#organizationId';
  await page.waitForSelector(fiscalCodePaTextInput);
  await page.click(fiscalCodePaTextInput);
  await page.keyboard.type(validFiscalCodePa);

  const verifyButton = '#verify';
  await page.waitForSelector(verifyButton);
  await page.click(verifyButton);


  await page.waitForResponse(
    response => response.request().method() === 'GET' && /payment-requests/.test(response.request().url()),
  );

  const infoImporto = '#importo';
  await page.waitForSelector(infoImporto);
  await page.click(infoImporto);

  const activeButton = '#active';
  await page.waitForSelector(activeButton);
  await page.click(activeButton);
};

export const payAndGetSuccessMessage = async (
  validUserMail,
  creditCardHolder,
  creditCardNumber,
  creditCardExpirationDate,
  creditCardSecureCode,
) => {
  /**
   * 1. index page
   */
  await page.waitForResponse(
    response => response.request().method() === 'GET' && /actions\/check/.test(response.request().url()),
  );
  const usetMailTextInput = '#useremail';
  await page.waitForSelector(usetMailTextInput);
  await page.click(usetMailTextInput);
  await page.keyboard.type(validUserMail);

  const emailButton = '#emailform > div.windowcont__bottom > div > div > button';
  await page.waitForSelector(emailButton);
  await page.click(emailButton);

  /**
   * 2. inputcard page
   */
  const creditCardHolderFieldS = '#creditcardname';
  await page.waitForSelector(creditCardHolderFieldS);
  await page.focus(creditCardHolderFieldS);
  await page.keyboard.type(creditCardHolder);

  const creditCardPANFieldS = '#creditcardnumber';
  await page.waitForSelector(creditCardPANFieldS);
  await page.focus(creditCardPANFieldS);
  await page.keyboard.type(creditCardNumber);

  const creditCardExpDateFieldS = '#creditcardexpirationdate';
  await page.waitForSelector(creditCardExpDateFieldS);
  await page.focus(creditCardExpDateFieldS);
  await page.keyboard.type(creditCardExpirationDate);

  const creditCardSecurCodeFieldS = '#creditcardsecurcode';
  await page.waitForSelector(creditCardSecurCodeFieldS);
  await page.focus(creditCardSecurCodeFieldS);
  await page.keyboard.type(creditCardSecureCode);

  const privacyToggleS = '#creditcardform #privacyToggler';
  await page.waitForSelector(privacyToggleS);
  await page.click(privacyToggleS);

  /**
   * 3. check page
   */
  const submitWalletbuttonS =
    '#creditcardform > .windowcont__bottom > .container > .windowcont__bottom__wrap > .btn-primary';
  await page.waitForSelector(submitWalletbuttonS);
  await page.click(submitWalletbuttonS);
  await page.waitForNavigation();

  const payButtonS = '#checkout > .windowcont__bottom > .container > .windowcont__bottom__wrap > .btn-primary';

  await page.waitForSelector(payButtonS);

  const [pay3ds2Response] = await Promise.all([
    page.waitForResponse(
      response => response.request().method() === 'POST' && /pay3ds2/.test(response.request().url()),
    ),
    page.click(payButtonS),
    page.waitForNavigation(),
  ]);

  expect(pay3ds2Response.status()).toEqual(200);

  /**
   * 4. response page - polling
   */
  let waitForFinalStatus = true;
  let jsonResponse = undefined;
  while (waitForFinalStatus) {
    const [transactionCheck] = await Promise.all([
      page.waitForResponse(
        response => response.request().method() === 'GET' && /actions\/check/.test(response.request().url()),
      ),
    ]);
    jsonResponse = await transactionCheck.json();

    waitForFinalStatus = jsonResponse.data.finalStatus === false;
  }

  /**
   * 5. response page - return final succes result of transaction
   */
  expect(jsonResponse.data.finalStatus).toEqual(true);
  expect(jsonResponse.data.idStatus).toEqual(3);
  const finalResult =
    'body > div > div.container.flex-fill.main > div > div > div.windowcont__response > div > div.h3.text-center';
  await page.waitForSelector(finalResult);
  const element = await page.$(finalResult);
  const successDescription = await page.evaluate(el => el.textContent, element);
 
  return successDescription;
};


export const verifyPaymentAndGetError = async (noticeCode, fiscalCodePa) => {

  const noticeCodeTextInput = '#paymentNoticeCode';
  await page.waitForSelector(noticeCodeTextInput);
  await page.click(noticeCodeTextInput);
  await page.keyboard.type(noticeCode);

  const fiscalCodePaTextInput = '#organizationId';
  await page.waitForSelector(fiscalCodePaTextInput);
  await page.click(fiscalCodePaTextInput);
  await page.keyboard.type(fiscalCodePa);

  const verifyButton = '#verify';
  await page.waitForSelector(verifyButton);
  await page.click(verifyButton);
                     
  const errorText = 'body > div.tingle-modal.tingle-modal--visible > div > div.tingle-modal-box__content > div.d-flex > h4';
  await page.waitForSelector(errorText);
  const element = await page.$(errorText);
  const errorDescription = await page.evaluate(el => el.textContent, element);

  return errorDescription;
};

export const verifyPaymentAndGetErrorCode = async (noticeCode, fiscalCodePa) => {

  const noticeCodeTextInput = '#paymentNoticeCode';
  await page.waitForSelector(noticeCodeTextInput);
  await page.click(noticeCodeTextInput);
  await page.keyboard.type(noticeCode);

  const fiscalCodePaTextInput = '#organizationId';
  await page.waitForSelector(fiscalCodePaTextInput);
  await page.click(fiscalCodePaTextInput);
  await page.keyboard.type(fiscalCodePa);

  const verifyButton = '#verify';
  await page.waitForSelector(verifyButton);
  await page.click(verifyButton);
                     
  const errorText = 'body > div.tingle-modal.tingle-modal--visible > div > div.tingle-modal-box__content > div.mb-3.modalwindow__content > div > div > b';
  await page.waitForSelector(errorText);
  const element = await page.$(errorText);
  const errorDescription = await page.evaluate(el => el.textContent, element);

  return errorDescription;
};

export const acceptCookiesBanner = async() => {
  const cookiesBanner = '#onetrust-banner-sdk';
  const cookiesBannerAcceptBtn = '#onetrust-accept-btn-handler';
  const overlayFilter = '#onetrust-consent-sdk > div.onetrust-pc-dark-filter.ot-fade-in'
  checkCookieBanner();

  await page.click(cookiesBannerAcceptBtn);
  
  await page.waitForResponse(
    response => response.request().method() === 'POST' && /consentreceipts/.test(response.request().url()),
  );

  /*
  * Wait until the banner is no more visible
  */
  await page.waitForSelector(cookiesBanner, {visible: false})
  await page.waitForSelector(overlayFilter, {hidden: true})
};

export const checkCookieBanner = async() => {
  const cookiesBanner = '#onetrust-banner-sdk';
  
  await page.waitForSelector(cookiesBanner, {visible: true});
};

export const showCookiesPreferences = async() => {
  const showPreferencesBtn = '#onetrust-pc-btn-handler';
  const preferencesDialog = '#onetrust-pc-sdk'

  await page.waitForSelector(showPreferencesBtn, {visible: true});
  await page.click(showPreferencesBtn);

  await page.waitForSelector(preferencesDialog, {visible: true})
};
