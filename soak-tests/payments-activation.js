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
        }
    }
}
