import http from 'k6/http';

export let options = {
  stages: [
    { duration: '1m', target: 1 }, // Ramp up to 10 RPS in 1 minute
    { duration: '1m', target: 2 }, // Maintain 10 RPS for 9 minutes
  ],
};

export default function () {
  let url = 'https://api.uat.platform.pagopa.it/checkout/auth-service/v1/auth/token';
  let payload = JSON.stringify({
    authCode: 'A5ZZ7hiYjLonO0mnp-ctn6CR9hXsCdRyEUW3YVdYl_0',
    state: '04afeac5-57ec-431c-a5ca-97d59a3ecca1',
  });

  let params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let response = http.post(url, payload, params);
  
  // Verify that the response contains the expected token
  if (response.status === 200) {
    console.log('AuthToken: ' + response.json());
    let jsonResponse = JSON.parse(response.body);
    if (!jsonResponse.authToken) {
      console.error('AuthToken not found in the response!');
    }
  } else {
    console.error(`HTTP Error: ${response.status}`);
  }

}