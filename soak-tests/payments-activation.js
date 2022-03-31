import http from 'k6/http';
import {check, sleep} from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 20 }, // ramp up to 20 users
        { duration: '3m', target: 20 }, // stay at 20 for ~3 min
        { duration: '1m', target: 0 }, // scale down. (optional)
    ],
};

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
    const startSessionBody = JSON.stringify({
        "data": {
            "email": "foo@example.com",
            "fiscalCode": "MRARSS90A01H501V",
            idPayment
        }
    });
    const startSessionResponse = http.post(`${paymentManagerApiUrl}/users/actions/start-session`, startSessionBody, headerParams, {tags: tagStartSession});
    check(startSessionResponse, {'startSession response is 200': r => r.status === 200}, {tags: tagStartSession});

    if (startSessionResponse.status !== 200) {
        console.log("startSession: " + startSessionResponse.status);
        console.log(JSON.stringify(startSessionResponse.json()));

        return;
    }

    const {sessionToken} = startSessionResponse.json();
    const paymentManagerHeaderParams = {
        headers: Object.assign(headerParams.headers, {
            'Authorization': `Bearer ${sessionToken}`,
        })
    };

    const tagApproveTerms = {pagoPaMethod: "approveTerms"};
    const approveTermsBody = JSON.stringify({
        "data": {
            "privacy": true,
            "terms": true
        }
    });
    const approveTermsResponse = http.post(`${paymentManagerApiUrl}/users/actions/approve-terms`, approveTermsBody, paymentManagerHeaderParams, {tags: tagStartSession});
    check(approveTermsResponse, {'approveTerms response is 200': r => r.status === 200}, {tags: tagApproveTerms});

    if (approveTermsResponse.status !== 200) {
        console.log("approveTerms: " + approveTermsResponse.status);
        console.log(JSON.stringify(approveTermsResponse.json()));

        return;
    }

    const tagAddWallet = {pagoPaMethod: "addWallet"};
    const addWalletBody = JSON.stringify({
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
    });
    const addWalletResponse = http.post(`${paymentManagerApiUrl}/wallet`, addWalletBody, paymentManagerHeaderParams, {tags: tagAddWallet});
    check(addWalletResponse, {'addWallet response is 200': r => r.status === 200}, {tags: tagAddWallet});

    if (addWalletResponse.status !== 200) {
        console.log("addWallet: " + addWalletResponse.status);
        console.log(JSON.stringify(addWalletResponse.json()));

        return;
    }

    const { idWallet } = addWalletResponse.json().data;
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
    const pay3ds2Body = JSON.stringify({
        "data": {
            "cvv": "123",
            idWallet,
            "threeDSData": JSON.stringify(threedsData),
            "tipo": "web"
        }
    });
    const payResponse = http.post(`${paymentManagerApiUrl}/payments/${idPayment}/actions/pay3ds2`, pay3ds2Body, paymentManagerHeaderParams, { tags: tagPay3ds2 });
    check(payResponse, {'pay3ds2 response is 200': r => r.status === 200}, {tags: tagPay3ds2});

    if (payResponse.status !== 200) {
        console.log("pay3ds2: " + payResponse.status);
        console.log(JSON.stringify(payResponse.json()));

        return;
    }

    const { id } = payResponse.json().data;
    const idTransaction = Base64.encode(String(id));
    const tagTransactionStatus = { pagoPaMethod: "getTransactionStatus" };
    const transactionStatusResponse = http.get(`${paymentManagerApiUrl}/transactions/${idTransaction}/actions/check`, paymentManagerHeaderParams, { tags: tagTransactionStatus });
    check(transactionStatusResponse, {'getTransactionStatus response is 200': r => r.status === 200}, {tags: tagTransactionStatus});

    if (transactionStatusResponse.status !== 200) {
        console.log("getTransactionStatus: " + transactionStatusResponse.status);
        console.log(JSON.stringify(transactionStatusResponse.json()));
    }
}

function generateMockEcRptId() {
    const min = 302001000000000000;
    const max = 302001999999999999;

    return `77777777777${Math.floor(Math.random() * (max - min + 1) + min)}`;
}

function generateDonationsRptId() {
    const auxDigit = 3;
    const segregationCode = "00";
    const idDonation = "00";
    const iuv = new Date().getTime();
    const ecCf = 13669721006;

    return `${ecCf}${auxDigit}${segregationCode}${idDonation}${iuv}`;
}

export function setup() {
    const urlBasePath = "https://api.uat.platform.pagopa.it/checkout/payments/v1";

    return {
        useDonationsRptId: __ENV.DONATIONS_RPT !== undefined ? (__ENV.DONATIONS_RPT === "true") : true,
        activationUrl: `${urlBasePath}/payment-activations`,
        verifyUrl: `${urlBasePath}/payment-requests`,
        activationStatusUrl: `${urlBasePath}/payment-activations`
    };
}

export default function ({ useDonationsRptId, verifyUrl, activationUrl, activationStatusUrl }) {
    const rptId = useDonationsRptId ? generateDonationsRptId() : generateMockEcRptId();

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

    check(verifyResponse, { 'verifyResponse status is OK': (r) => r.status === 200 || (r.status === 400 && r.json().detail !== undefined) }, tagVerify);

    if (verifyResponse.status != 200 && verifyResponse.status !== 400) {

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

        check(activationResponse, { 'activationResponse status is OK': (r) => r.status === 200 || (r.status === 400 && r.json().detail !== undefined)}, tagActivation);

        if (activationResponse.status != 200 && activationResponse.status !== 400) {

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

            check(activationStatusResponse, { 'activationStatusResponse status is OK': (r) => r.status === 200 || (r.status === 400 && r.json().detail !== undefined) }, tagActivation);

            if (activationStatusResponse.status != 200 && activationStatusResponse.status !== 400) {
                console.log("activationStatusResponse: " + activationStatusResponse.status);

                console.log(JSON.stringify(activationResponse.json()));
                return;
            }

            const { idPagamento: idPayment } = activationStatusResponse.json();

            doTransaction("https://acardste.vaservices.eu/pp-restapi/v4", idPayment, headersParams);
        }
    }
}
