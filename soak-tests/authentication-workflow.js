import { check, sleep } from 'k6';
import http from 'k6/http';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';

/*** Configs section ***/

const LOG_ENABLED = false
const ENV = "uat" // dev | uat
const BASE_PATH = `https://weu${ENV}.checkout.internal.${ENV}.platform.pagopa.it`;

const AUTH_SERVICE_PATH = `${BASE_PATH}/beta/pagopa-checkout-auth-service`

const authServiceURLs = {
    loginUrl: `${AUTH_SERVICE_PATH}/auth/login?recaptcha=auth-service-recaptcha`,
    postTokenUrl: `${AUTH_SERVICE_PATH}/auth/token`,
    validateUrl: `${AUTH_SERVICE_PATH}/auth/validate`,
    getUsersUrl: `${AUTH_SERVICE_PATH}/auth/users`,
    logoutUrl: `${AUTH_SERVICE_PATH}/auth/logout`,
}

const k6Options = {
    scenarios: {
      contacts: {
        executor: 'ramping-arrival-rate',
        startRate: 0,
        timeUnit: '1s',
        preAllocatedVUs: 100,
        maxVUs: 10000,
        stages: [
          { target: 10, duration: "10m" },
          { target: 20, duration: "5m" },
          { target: 20, duration: "2h" },
          { target: 0, duration: "10m" },
        ],
      },
    },

    thresholds: {
        http_req_duration: ["p(95)<=250"], // 95% of requests must complete below 250ms
        checks: ['rate>0.9'], // 90% of the request must be completed
        "http_req_duration{name:login}": ["p(95)<=250"],
        "http_req_duration{name:login-redirect}": ["p(95)<=250"],
        "http_req_duration{name:post-token}": ["p(95)<=250"],
        "http_req_duration{name:validate}": ["p(95)<=250"],
        "http_req_duration{name:get-users}": ["p(95)<=250"],
        "http_req_duration{name:logout}": ["p(95)<=250"],
    },
};

/*** k6 setup and main function ***/

const k6Setup = () => {
    logStep(0, "k6 setup function DONE")
}

const k6Main = () => {
    logStep(0, "k6 main function START")

    // 1) login request with recaptcha
    let response = step1PerformLogin()

    check(response, {
        'initial login request is successful': (r) => r.status === 200,
        'redirect URL is present': (r) => !!r.json('urlRedirect'),
    },  { name: "login" });

    let redirectUrl = response.json('urlRedirect');

    logStep(1, "login request done", { redirectUrl })

    const [_, queryString] = redirectUrl.split("?")

    const queryParams = queryString.split("&")
    
    const nonce = queryParams.find(q => q.includes("nonce")).split("=")[1];
    const state = queryParams.find(q => q.includes("state")).split("=")[1];

    const initMockUrl = `${BASE_PATH}/pagopa-checkout-identity-provider-mock/initMock`
    const initMockResponse = http.post(
        initMockUrl,
        JSON.stringify({
            use_nonce: nonce,
        }),
        { headers: { 'Content-Type': 'application/json' }}
    )

    const authCode = initMockResponse.json('authCode')

    response = step3PostToken(authCode, state)

    check(response, {
        'token request is successful': (r) => r.status === 200,
        'token response contains token': (r) => !!r.json('authToken'),
    },  { name: "post-token" });

    const authToken = response.json('authToken')

    logStep(3, "got auth token", { authToken })

    // 4) validate token - 3 times because is involved multiple times
    for (let i = 0; i < 3; i++) {

        response = step4ValidateToken(authToken)

        check(response, {
            'token is valid': (r) => r.status === 200,
        },  { name: "validate" });
        
        sleep(3);
    }

    // 5) get user info
    response = step5GetUsers(authToken)
    check(response, {
        'Get user request successful': (r) => r.status === 200,
        'Has userId in response': (r) => !!r.json('userId'),
        'Has name in response': (r) => !!r.json('name'),
        'Has familyName in response': (r) => !!r.json('familyName'),
    },  { name: "get-users" });

    logStep(5, "userId is", response.json('userId'))

    // 6) logout
    response = step6Logout(authToken)

    check(response, {
        'Logout successfully': (r) => r.status === 204,
    },  { name: "logout" });

    logStep(100, "k6 main function DONE")
}

/*** Helpers functions ***/

const step1PerformLogin = () => 
    http.get(
        authServiceURLs.loginUrl,
        { headers: { 'Content-Type': 'application/json' }, tags: { name: 'login'}, timeout: '10s' }
    );

const step2PerformLoginRedirect = (redirectUrl) => http.get(redirectUrl, { tags: { name: 'login-redirect'}, timeout: '10s' })

const step3PostToken = (authCode, state) => 
    http.post(
        authServiceURLs.postTokenUrl,
        JSON.stringify({ authCode: authCode, state: state }),
        { headers: { 'Content-Type': 'application/json' }, tags: { name: 'post-token'}, timeout: '10s' }
    )

const step4ValidateToken = (token) =>
    http.get(
        authServiceURLs.validateUrl,
        { headers: { 'Authorization': `Bearer ${token}`}, tags: { name: 'validate'}, timeout: '10s' }
    )

const step5GetUsers = (token) =>
    http.get(
        authServiceURLs.getUsersUrl,
        { headers: { 'Authorization': `Bearer ${token}`}, tags: { name: 'get-users'}, timeout: '10s' }
    )

const step6Logout = (token) =>
    http.post(
        authServiceURLs.logoutUrl,
        null,
        { headers: { 'Authorization': `Bearer ${token}`}, tags: { name: 'logout'}, timeout: '10s' }
    )

/**
 * Transform the redirect URL to point to the ingress
 * 
 * @param {string} originalUrl 
 * @returns 
 */
function transformOneIdentityRedirectUrl(originalUrl) {
    // Parse the original URL
    
    const [_, queryString] = originalUrl.split("?")

    const newHostname = `weu${ENV}.checkout.internal.${ENV}.platform.pagopa.it`;

    const transformedUrl = `https://${newHostname}/pagopa-checkout-identity-provider-mock/login?${queryString}`;

    return transformedUrl;
}

/**
 * Extract code and state from the auth-callback URL
 * 
 * @param {string} redirectUrlHtmlBody 
 * @returns 
 */
const extractCallbackAuthParam = (redirectUrlHtmlBody) => {
    const callbackUrlMatch = redirectUrlHtmlBody.match(/href=['"]([^'"]*auth-callback[^'"]*)['"]/);
    
    if (!callbackUrlMatch) {
        console.error('Could not find callback URL in response');
        return {};
    }

    const callbackUrl = callbackUrlMatch[1];

    const callbackUrlParams = new URL(callbackUrl);
    const authCode = callbackUrlParams.searchParams.get('code');
    const state = callbackUrlParams.searchParams.get('state');

    return { authCode, state }
}

const logStep = (step, msg, other = {}) => {
    if (!LOG_ENABLED) {
        return;
    }

    console.log(`STEP ${step}: ${msg}`, other);
};

/*** End helpers functions ***/

export {
    k6Options as options,
    k6Setup as setup,

    // Default k6 function
    k6Main as default,
}