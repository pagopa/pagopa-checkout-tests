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
              { duration: '10s', target: 100 },
              { duration: '10s', target: 200 },
              { duration: '10s', target: 100 },
            ]
        }
    },
    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};

export function setup() {
    return {
    };
}

export default function (data) {
    // Values from env var.
    var urlBasePath = "https://api.io.italia.it";
 
    // Send new message
    var tag = {
        pagoPaMethod: "GetActivationStatus",
    }; 
    var url = `${urlBasePath}/api/payportal/v1/payment-activations/d410aef0254f11ecbd9d117f3274388b`;
    var r = http.get(url, {
        tags: tag,
    });
    
    console.log("Get activation status " + r.status);
    check(r, { 'status is 200': (r) => r.status === 200 }, tag);
 
}
