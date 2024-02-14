import http from 'k6/http';
import { check } from 'k6';
import { URL, URLSearchParams } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export let options = {
    stages: [
        { duration: '5m', target: 70 },  // ramp up to 70 users
        { duration: '30m', target: 70 }, // stay at 70 for ~30 min
        { duration: '5m', target: 0 },   // scale down. (optional)
    ],
};

const BASE_PATH = "https://api.dev.platform.pagopa.it";
const PAYMENT_METHOD_ID = "e7058cac-5e1a-4002-8994-5bab31e9f385";
const PAN = "4349940199004549";
const CARD_DATA = {
    pan: PAN,
    bin: PAN.slice(0, 9),
    expiration: "12/25",
    holder: "Test Test",
    cvv: "123"
}

const HEADERS = {
    'Content-Type': 'application/json',
};


export function setup() {
    return {
    };
}

function getPaymentInfo(paFiscalCode, noticeCode, tags) {
    const url = `${BASE_PATH}/ecommerce/checkout/v1/payment-requests/${paFiscalCode}${noticeCode}?recaptchaResponse=token`;
    return http.get(url, { headers: HEADERS, tags });
}

function createSession(tags) {
    const url = `${BASE_PATH}/ecommerce/checkout/v1/payment-methods/${PAYMENT_METHOD_ID}/sessions?recaptchaResponse=test`;
    return http.post(url, "", { headers: HEADERS, tags });
}

function createTransaction(orderId, paFiscalCode, noticeCode, amount, tags) {
    const url = `${BASE_PATH}/ecommerce/checkout/v2/transactions?recaptchaResponse=token`;

    return http.post(url,
        JSON.stringify({
            "paymentNotices": [
                {
                    "rptId": paFiscalCode + noticeCode,
                    "amount": amount
                }
            ],
            "orderId": orderId,
            "email": "mario.rossi@example.com"
        }),
        { headers: Object.assign({}, HEADERS, {"x-correlation-id": uuidv4() }), tags },
    );
}

function computeFees(token, paFiscalCode, transactionId, bin, amount, tags) {
    const url = `${BASE_PATH}/ecommerce/checkout/v1/payment-methods/${PAYMENT_METHOD_ID}/fees`;

    return http.post(url,
        JSON.stringify({
            "bin": bin,
            "touchpoint": "CHECKOUT",
            "paymentAmount": amount,
            "isAllCCP": false,
            "primaryCreditorInstitution": paFiscalCode,
            "transferList": [
                {
                    "creditorInstitution": paFiscalCode,
                    "digitalStamp": false
                }
            ]
        }),
        {
            headers: Object.assign(
                {},
                HEADERS,
                {
                    "Authorization": `Bearer ${token}`,
                    "x-transaction-id-from-client": transactionId
                }
            ),
            tags
        },
    );
}

function fillGatewayCardData(npgCorrelationId, npgSessionId, tags) {
    const url = `https://stg-ta.nexigroup.com/fe/build/text/`;
    return http.post(url, JSON.stringify({
        "fieldValues": [
            {
                "id": "EXPIRATION_DATE",
                "value": CARD_DATA.expiration
            },
            {
                "id": "CARD_NUMBER",
                "value": CARD_DATA.pan
            },
            {
                "id": "SECURITY_CODE",
                "value": CARD_DATA.cvv
            },
            {
                "id": "CARDHOLDER_NAME",
                "value": CARD_DATA.holder
            }
        ]
    }),
    {
        headers: Object.assign({},
            HEADERS,
            {
                "Idempotency-Key": uuidv4(),
                "Correlation-Id": npgCorrelationId,
                "session": npgSessionId
            }),
        tags
    });
}

function requestAuthorization(token, transactionId, amount, fee, pspId, orderId, isAllCCP, tags) {
    const url = `${BASE_PATH}/ecommerce/checkout/v1/transactions/${transactionId}/auth-requests`;

    return http.post(url,
        JSON.stringify({
            amount: amount,
            fee: fee,
            paymentInstrumentId: PAYMENT_METHOD_ID,
            pspId: pspId,
            isAllCCP: isAllCCP,
            language: "IT",
            details: {
                detailType: "cards",
                orderId: orderId
            }
        }),
        { headers: Object.assign({}, HEADERS, { "Authorization": `Bearer ${token}` }), tags },
    );
}

export default function () {
    const min = 0;
    const max = 999999999;

    const randomSuffix = String(Math.floor(Math.random() * (max - min + 1) + min)).padStart(9, '0');
    const noticeCode = "302001000" + randomSuffix;
    const paFiscalCode = "77777777777";

    // 1. Verification Step
    const getPaymentInfoTag = {
        pagoPaMethod: "GetPaymentInfo",
    };
    const getPaymentInfoResponse = getPaymentInfo(paFiscalCode, noticeCode, getPaymentInfoTag);
    check(getPaymentInfoResponse, { 'getPaymentInfoResponse status is 200': (r) => r.status === 200 }, getPaymentInfoTag);

    if (getPaymentInfoResponse.status != 200) {
        console.error("getPaymentInfoResponse: " + getPaymentInfoResponse.status);
        console.error(getPaymentInfoResponse.body);

        return;
    }

    // 2a. Create session
    const sessionCreateTag = {
        pagoPaMethod: "SessionCreate",
    };
    const createSessionResponse = createSession(sessionCreateTag);

    check(createSessionResponse, { 'createSessionResponse status is 200': (r) => r.status === 200 }, sessionCreateTag);

    if (createSessionResponse.status != 200) {
        console.error("createSessionResponse: " + createSessionResponse.status);
        console.error(createSessionResponse.body);

        return;
    }

    // 2b. Activation Step
    const amount = getPaymentInfoResponse.json().amount;
    const orderId = createSessionResponse.json()["orderId"];

    const transactionCreateTag = {
        pagoPaMethod: "TransactionCreate",
    };

    const createTransactionResponse = createTransaction(orderId, paFiscalCode, noticeCode, amount, transactionCreateTag);

    check(createTransactionResponse, { 'createTransactionResponse status is 200': (r) => r.status === 200 }, transactionCreateTag);

    if (createTransactionResponse.status != 200) {
        console.error("createTransactionResponse: " + createTransactionResponse.status);
        console.error(createTransactionResponse.body);

        return;
    }

    // 3. Compute fees for credit card
    const token = createTransactionResponse.json()["authToken"];
    const transactionId = createTransactionResponse.json()["transactionId"];

    const computeFeesTag = {
        pagoPaMethod: "ComputeFees",
    };

    const computeFeesResponse = computeFees(
        token,
        paFiscalCode,
        transactionId,
        CARD_DATA.bin,
        amount,
        computeFeesTag
    );

    check(computeFeesResponse, { 'computeFeesResponse status is 200': (r) => r.status === 200 }, computeFeesTag);

    if (computeFeesResponse.status != 200) {
        console.error("computeFeesResponse: " + computeFeesResponse.status);
        console.error(computeFeesResponse.body);

        return;
    }

    // 4a. Fill NPG data
    const fieldUrl = new URL(createSessionResponse.json().paymentMethodData.form[0].src);
    const urlParams = new URLSearchParams(fieldUrl.search);

    const npgCorrelationId = urlParams.get("correlationid");
    const npgSessionId = urlParams.get("sessionid");

    const npgFillTag = {
        pagoPaMethod: "NpgFill",
    };

    const npgFillResponse = fillGatewayCardData(npgCorrelationId, npgSessionId, npgFillTag);

    check(npgFillResponse, { 'npgFillResponse status is 200': (r) => r.status === 200 }, npgFillTag);

    if (npgFillResponse.status != 200) {
        console.error("npgFillResponse: " + npgFillResponse.status);
        console.error(npgFillResponse.body);

        return;
    }

    // 4b. Request authorization
    const requestAuthorizationTag = {
        pagoPaMethod: "RequestAuthorization",
    };

    const isAllCCP = createTransactionResponse.json()["payments"].map(p => p.isAllCCP).reduce((prev, curr) => prev && curr);

    const bundle = computeFeesResponse.json()["bundles"].filter(b => b["idPsp"] == "BCITITMM")[0];
    const { idPsp, taxPayerFee } = bundle;

    const requestAuthorizationResponse = requestAuthorization(
        token,
        transactionId,
        amount,
        taxPayerFee,
        idPsp,
        orderId,
        isAllCCP,
        requestAuthorizationTag
    );

    check(requestAuthorizationResponse, { 'requestAuthorizationResponse status is 200': (r) => r.status === 200 }, requestAuthorizationTag);

    if (requestAuthorizationResponse.status != 200) {
        console.error("requestAuthorizationResponse: " + requestAuthorizationResponse.status);
        console.error(requestAuthorizationResponse.body);
    }
}
