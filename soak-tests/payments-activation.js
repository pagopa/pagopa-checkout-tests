import http from 'k6/http';
import {check, sleep} from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 20 }, // ramp up to 20 users
        { duration: '3m', target: 20 }, // stay at 20 for ~3 min
        { duration: '1m', target: 0 }, // scale down. (optional)
    ],
};

function setupV1() {
    return "https://api.uat.platform.pagopa.it/api/checkout/payments/v1";
}

function setupV2() {
    return "https://api.uat.platform.pagopa.it/checkout/payments/v1";
}

function doTransaction(paymentManagerApiUrl, idPayment, headerParams) {
    const tagCheckStatus = {pagoPaMethod: 'checkStatus'};
    const checkTransactionStatusResponse = http.get(`${paymentManagerApiUrl}/payments/${idPayment}/actions/check`, headerParams, {tags: tagCheckStatus});

    check(checkTransactionStatusResponse, {'checkStatus response is 200': r => r.status === 200}, {tags: tagCheckStatus});

    if (checkTransactionStatusResponse.status !== 200) {
        console.log("checkStatus: " + checkTransactionStatusResponse.status);
        console.log(JSON.stringify(checkTransactionStatusResponse.json()));

        return;
    }

    const tagStartSession = {pagoPaMethod: 'startSession'};
    const startSessionBody = {
        "data": {
            "email": "foo@example.com",
            "fiscalCode": "MRARSS90A01H501V",
            idPayment
        }
    };
    const startSessionResponse = http.post(`${paymentManagerApiUrl}/users/actions/start-session`, startSessionBody, headerParams, {tags: tagStartSession});
    check(startSessionResponse, {'startSession response is 200': r => r.status === 200}, {tags: tagStartSession});

    if (startSessionResponse.status !== 200) {
        console.log("startSession: " + startSessionResponse.status);
        console.log(JSON.stringify(startSessionResponse.json()));

        return;
    }

    const {sessionToken} = startSessionResponse.json();
    const paymentManagerAuthHeaders = {
        headers: {
            'Authorization': sessionToken
        }
    };
    const paymentManagerheadersParams = Object.assign(headerParams, paymentManagerAuthHeaders);

    const tagApproveTerms = {pagoPaMethod: "approveTerms"};
    const approveTermsBody = {
        "data": {
            "privacy": true,
            "terms": true
        }
    };
    const approveTermsResponse = http.post(`${paymentManagerApiUrl}/users/actions/approve-terms`, approveTermsBody, paymentManagerheadersParams, {tags: tagStartSession});
    check(approveTermsResponse, {'approveTerms response is 200': r => r.status === 200}, {tags: tagApproveTerms});

    if (approveTermsResponse.status !== 200) {
        console.log("approveTerms: " + approveTermsResponse.status);
        console.log(JSON.stringify(approveTermsResponse.json()));

        return;
    }

    const tagAddWallet = {pagoPaMethod: "addWallet"};
    const addWalletBody = {
        "data": {
            "creditCard": {
                "expireMonth": "12",
                "expireYear": "30",
                "holder": "Mario Rossi",
                "pan": "5111114000023477",
                "securityCode": "123"
            },
            "idPagamentoFromEC": "e1283f0e673b4789a2af87fd9b4043f4",
            "type": "CREDIT_CARD"
        }
    };
    const addWalletResponse = http.post(`${paymentManagerApiUrl}/wallet`, addWalletBody, paymentManagerheadersParams, {tags: tagAddWallet});
    check(addWalletResponse, {'addWallet response is 200': r => r.status === 200}, {tags: tagAddWallet});

    if (addWalletResponse.status !== 200) {
        console.log("addWallet: " + addWalletResponse.status);
        console.log(JSON.stringify(addWalletResponse.json()));

        return;
    }

    const { idWallet } = addWalletResponse.json();
    const tagPay3ds2 = {pagoPaMethod: "pay3ds2"};
    const threedsData = {
        "browserJavaEnabled": "false",
        "browserLanguage": "it-IT",
        "browserColorDepth": "24",
        "browserScreenHeight": "1080",
        "browserScreenWidth": "1920",
        "browserTZ": "-120",
        "browserAcceptHeader": "",
        "browserIP": "",
        "browserUserAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0",
        "acctID": "ACCT_94187",
        "deliveryEmailAddress": "foo@example.com",
        "mobilePhone": null
    };
    const pay3ds2Body = {
        "data": {
            "cvv": "123",
            "idWallet": 94187,
            "threeDSData": JSON.stringify(threedsData),
            "tipo": "web"
        }
    };
    const payResponse = http.post(`${paymentManagerApiUrl}/payments/${idPayment}/actions/pay3ds2`, pay3ds2Body, paymentManagerheadersParams, { tags: tagPay3ds2 });
    check(payResponse, {'pay3ds2 response is 200': r => r.status === 200}, {tags: tagPay3ds2});

    if (payResponse.status !== 200) {
        console.log("pay3ds2: " + payResponse.status);
        console.log(JSON.stringify(payResponse.json()));
    }
}

export function setup() {
    let urlBasePath;
    if (__ENV.API_VERSION === "v1") {
        console.info("Running soak tests on Checkout API v1");
        urlBasePath = setupV1();
    } else {
        console.info("Running soak tests on Checkout API v2");
        urlBasePath = setupV2();
    }

    return {
        activationUrl: `${urlBasePath}/payment-activations`,
        verifyUrl: `${urlBasePath}/payment-requests`,
        activationStatusUrl: `${urlBasePath}/payment-activations`
    };
}

export default function ({ verifyUrl, activationUrl, activationStatusUrl }) {
    const auxDigit = 3;
    const segregationCode = "00";
    const idDonation = "00";
    const iuv = new Date().getTime();
    const ecCf = 13669721006;

    const rptId = `${ecCf}${auxDigit}${segregationCode}${idDonation}${iuv}`;

    const headersParams = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // 1. Verification Step
    const tagVerify = {
        pagoPaMethod: "GetPaymentInfo",
    };
    const verifyResponse = http.get(`${verifyUrl}/${rptId}?recaptchaResponse=token`, headersParams, {
        tags: tagVerify
    });

    check(verifyResponse, { 'verifyResponse status is 200': (r) => r.status === 200 }, tagVerify);

    if (verifyResponse.status != 200) {

        console.log("verifyResponse: " + verifyResponse.status);
        console.log(JSON.stringify(verifyResponse.json()));
    } else {
        // 2. Activation Step
        const codiceContestoPagamento = verifyResponse.json().codiceContestoPagamento;
        const importoSingoloVersamento = verifyResponse.json().importoSingoloVersamento;

        const tagActivation = {
            pagoPaMethod: "PostActivation",
        };

        const body = JSON.stringify({
            rptId,
            codiceContestoPagamento,
            importoSingoloVersamento
        });

        const activationResponse = http.post(
            `${activationUrl}?recaptchaResponse=token`,
            body,
            headersParams,
            {
                tags: tagActivation
            }
        );

        check(activationResponse, { 'activationResponse status is 200': (r) => r.status === 200 }, tagActivation);

        if (activationResponse.status != 200) {

            console.log("activationResponse: " + activationResponse.status);
            console.log(JSON.stringify(activationResponse.json()));

        } else {

            // 3. Activation Step
            const tagActivationStatus = {
                pagoPaMethod: "GetActivationStatus",
            };

            let activationCompleted = false;
            const maxCheck = 50;
            let checks = 0;
            let activationStatusResponse;

            while (!activationCompleted && checks < maxCheck) {
                activationStatusResponse = http.get(`${activationStatusUrl}/${codiceContestoPagamento}`, {
                    tags: tagActivationStatus,
                });
                checks++;
                activationCompleted = activationStatusResponse.status == 200 ? true : false;
                sleep(2);
            }

            if (activationStatusResponse.status != 200) {
                console.log(activationStatusResponse.status);
            }

            check(activationStatusResponse, { 'activationStatusResponse status is 200': (r) => r.status === 200 }, tagActivation);

            const { idPagamento: idPayment } = activationStatusResponse.json();

            doTransaction("http://acardste.vaservices.eu/pp-restapi/v4", idPayment, headersParams);
        }
    }
}
