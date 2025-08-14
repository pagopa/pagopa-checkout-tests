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
    const urlBasePath = "https://api.uat.platform.pagopa.it";
 
    // Send new message
    const tag = {
        pagoPaMethod: "GetActivationStatus",
    }; 

    var notFoundCcp = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   
    for (var i = 0; i < 32; i++)
        notFoundCcp += possible.charAt(Math.floor(Math.random() * possible.length));
     
    const url = `${urlBasePath}/checkout/payments/v1/payment-activations/${notFoundCcp}`;
    const r = http.get(url, {
        tags: tag,
    });
    
    check(r, { 'status is 404': (r) => r.status === 404 }, tag);
}
