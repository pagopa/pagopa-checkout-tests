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
const CCV_INPUT = '#cvv';
const HOLDER_NAME_INPUT = '#name';
const PAYMENT_SUMMARY_BUTTON_ID = '#paymentSummaryButtonPay';
const CONTINUE_PAYMENT_BUTTON = 'button[type=submit]';
const VALID_FISCAL_CODE = String(process.env.VALID_FISCAL_CODE);
const VALID_RANGE_END_NOTICE_CODE = Number(String(process.env.VALID_NOTICE_CODE_PREFIX).concat('9999999999999'));
const VALID_RANGE_START_NOTICE_CODE = Number(String(process.env.VALID_NOTICE_CODE_PREFIX).concat('0000000000000'));

const VALID_CARD_DATA = {
  number: String(process.env.CARD_NUMBER),
  expirationDate: String(process.env.CARD_EXPIRATION_DATE),
  ccv: String(process.env.CARD_CCV),
  holderName: String(process.env.CARD_HOLDER_NAME),
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
  VALID_RANGE_END_NOTICE_CODE,
  VALID_RANGE_START_NOTICE_CODE,
  ACCEPT_POLICY_BUTTON_ID,
  PAYMENT_SUMMARY_BUTTON_ID,
  CARD_NUMBER_INPUT,
  EXPIRATION_DATE_INPUT,
  CCV_INPUT,
  HOLDER_NAME_INPUT,
  CONTINUE_PAYMENT_BUTTON,
  VALID_CARD_DATA,
};
