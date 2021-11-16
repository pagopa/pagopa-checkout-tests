import http from 'k6/http';

/*
* Testing the automated scaling-out 
*/

export let options = {
    stages: [
      { duration: '5m', target: 5000 }, // ramp up to 5000 users
      { duration: '6m', target: 5000 }, // stay at 5000 for >4 min
      { duration: '1m', target: 0 }, // scale down. 
    ],
  };


export function setup() {
    return {
    };
}

export default function () {

    const urlBasePath = "https://api.platform.pagopa.it";


    const getInfo = http.get(`${urlBasePath}/api/checkout/payments/v1/browsers/current/info`);

    if ( getInfo.status != 200 ) {
        console.log("verifyResponse: " + verifyResponse.status);
        console.log(JSON.stringify(verifyResponse.json()));
    }

}
