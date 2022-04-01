import http from 'k6/http';
import { check } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 200 },
        { duration: '2m', target: 500 },
        { duration: '1m', target: 200 },
      ]
};

export function setup() {
    return {
    };
}

export default function (data) {
    
    var urlBasePath = "https://api.uat.platform.pagopa.it";
    const validRptId = "01199250158002721253546529490";
    
    const headersParams = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    // 1. Verification Step
    var tagVerify = {
        pagoPaMethod: "GetPaymentInfo",
    };
    var verifyResponse = http.get(`${urlBasePath}/checkout/payments/v1/payment-requests/${validRptId}?recaptchaResponse=token`, headersParams, {
        tags: tagVerify
    });

    check(verifyResponse, { 'status is 400 (invalid rptID)': (r) => r.status === 400 }, tagVerify);
}