import http from 'k6/http';
import { check } from 'k6';

export let options = {
    stages: [
        { duration: '2m', target: 200 },
        { duration: '10m', target: 500 },
        { duration: '2m', target: 200 },
      ]
};

export function setup() {
    return {
    };
}

export default function (data) {
    // Values from env var.
    var urlBasePath = "https://api.uat.platform.pagopa.it";
 
    // Send new message
    var tag = {
        pagoPaMethod: "GetActivationStatus",
    }; 
    var url = `${urlBasePath}/checkout/payments/v1/payment-activations/51665c20b01411ec8b020996dc93061d`;
    var r = http.get(url, {
        tags: tag,
    });
    
    console.log("Get activation status " + r.status);
    check(r, { 'status is 200': (r) => r.status === 200 }, tag);
 
}
