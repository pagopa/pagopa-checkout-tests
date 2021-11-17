import http from 'k6/http';

/*
* Testing the automated scaling-out 
*/

/*
export let options = {
    stages: [
      { duration: '5m', target: 100 }, // ramp up to 5000 users
      { duration: '6m', target: 100 }, // stay at 5000 for >4 min
      { duration: '1m', target: 0 }, // scale down. 
    ],
  };
*/

export let options = {
    stages: [
        { 
            executor: 'constant-arrival-rate',
            target: 100,
            rate: 50, // 100 RPS, since timeUnit is the default 1s
            duration: '5m',
            maxVUs: 100,
        }, 
        { 
            executor: 'constant-arrival-rate',
            target: 100,
            rate: 50, // 100 RPS, since timeUnit is the default 1s
            duration: '30m',
            maxVUs: 100,
        }, 
      ],
}


export function setup() {
    return {
    };
}

export default function () {

    const urlBasePath = "https://api.platform.pagopa.it";
    
    const headersParams = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text',
            'User-Agent': 'agent'
        },
    };

    const getInfo = http.get(`${urlBasePath}/api/checkout/payments/v1/browsers/current/info`, headersParams);

    if ( getInfo.status != 200 ) {
        console.log("getCurrentInfo: " + getInfo.status);
    }

}
