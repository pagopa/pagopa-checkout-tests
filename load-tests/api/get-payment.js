import http from 'k6/http';
import { check } from 'k6';

export let options = {
    scenarios: {
        contacts: {
            executor: 'ramping-arrival-rate',
            startRate: 50,
            timeUnit: '1s',
            preAllocatedVUs: 50,
            maxVUs: 100,
            stages: [
<<<<<<< HEAD
              { duration: '20s', target: 100 },
              { duration: '20s', target: 200 },
              { duration: '20s', target: 100 },
            ]
        }
    },
    // thresholds: {
    //     http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    // },
=======
              { duration: '10s', target: 100 },
              { duration: '10s', target: 200 },
              { duration: '10s', target: 100 },
            ]
        }
    },
    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
>>>>>>> main
};

export function setup() {
    return {
    };
}

export default function (data) {
<<<<<<< HEAD
    
    const urlBasePath = "https://api.io.italia.it";
    const validRptId = "01199250158002721253546529490";
    
    const headersParams = {
=======
    // Values from env var.
    var urlBasePath = "https://api.io.italia.it";
 
    var validRptId = "77777777777302000100000009424";

    var headersParams = {
>>>>>>> main
        headers: {
            'Content-Type': 'application/json',
        },
    };
<<<<<<< HEAD
    
    // 1. Verification Step
    var tagVerify = {
        pagoPaMethod: "GetPaymentInfo",
    };
    var verifyResponse = http.get(`${urlBasePath}/api/payportal/v1/payment-requests/${validRptId}?recaptchaResponse=token`, headersParams, {
        tags: tagVerify
    });
    
    check(verifyResponse, { 'status is 200': (r) => r.status === 200 }, tagVerify);
=======

    // Send new message
    var tag = {
        pagoPaMethod: "GetPaymentInfo",
    };
    var url = `${urlBasePath}/api/payportal/v1/payment-requests/${validRptId}?recaptchaResponse=token`;
    var r = http.get(url, headersParams, {
        tags: tag,
    });
    
    console.log("Get payment info " + r.status);
    check(r, { 'status is 200': (r) => r.status === 200 }, tag);
 
>>>>>>> main
}
