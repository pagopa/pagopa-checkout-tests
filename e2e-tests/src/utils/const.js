const CHECKOUT_URL = String(process.env.CHECKOUT_URL);
const ACCEPT_POLICY_BUTTON_ID = '#onetrust-accept-btn-handler';
const EMAIL = String(process.env.EMAIL);
const VERIFY_BUTTON_ID = '#paymentNoticeButtonContinue';
const CONTINUE_BUTTON_ID = '#paymentEmailPageButtonContinue';
const BILL_CODE_ID = '#billCode';
const CF_ID = '#cf';
const EMAIL_ID = '#email';
const CHECK_EMAIL_ID = '#confirmEmail';
const CARD_NUMBER_INPUT = '#number';
const EXPIRATION_DATE_INPUT = '#expirationDate';
const CVV_INPUT = '#cvv';
const HOLDER_NAME_INPUT = '#name';
const PAYMENT_SUMMARY_BUTTON_ID = '#paymentSummaryButtonPay';
const CONTINUE_PAYMENT_BUTTON = 'button[type=submit]';
const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
const INVALID_FISCAL_CODE = String(process.env.INVALID_FISCAL_CODE);
const VALID_RANGE_END_NOTICE_CODE = Number(String(process.env.VALID_NOTICE_CODE_PREFIX).concat('9999999999999'));
const VALID_RANGE_START_NOTICE_CODE = Number(String(process.env.VALID_NOTICE_CODE_PREFIX).concat('0000000000000'));
const CARD_NUMBER_VPOS = String(process.env.CARD_NUMBER_VPOS);
const CARD_NUMBER_XPAY = String(process.env.CARD_NUMBER_XPAY);
const CARD_EXPIRATION_DATE = String(process.env.CARD_EXPIRATION_DATE);
const CVV = String(process.env.CARD_CCV);
const HOLDER_NAME = String(process.env.CARD_HOLDER_NAME);

const VALID_CARD_DATA = {
  number: CARD_NUMBER_VPOS,
  expirationDate: CARD_EXPIRATION_DATE,
  cvv: CVV,
  holderName: HOLDER_NAME,
};

export {
  CHECKOUT_URL,
  EMAIL,
  VERIFY_BUTTON_ID,
  CONTINUE_BUTTON_ID,
  BILL_CODE_ID,
  CF_ID,
  EMAIL_ID,
  CHECK_EMAIL_ID,
  VALID_FISCAL_CODE,
  INVALID_FISCAL_CODE,
  VALID_RANGE_END_NOTICE_CODE,
  VALID_RANGE_START_NOTICE_CODE,
  ACCEPT_POLICY_BUTTON_ID,
  PAYMENT_SUMMARY_BUTTON_ID,
  CARD_NUMBER_INPUT,
  EXPIRATION_DATE_INPUT,
  CVV_INPUT,
  HOLDER_NAME_INPUT,
  HOLDER_NAME,
  CVV,
  CONTINUE_PAYMENT_BUTTON,
  VALID_CARD_DATA,
  CARD_EXPIRATION_DATE,
  CARD_NUMBER_XPAY,
  CARD_NUMBER_VPOS,
};
