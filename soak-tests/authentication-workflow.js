import { check } from 'k6';
import http from 'k6/http';
import { Counter } from 'k6/metrics'
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';

const iterationCounter = new Counter('iterations');

/*** Configs section ***/

const LOG_ENABLED = false
const ENV = "dev" // dev | uat
const BASE_PATH = `https://weu${ENV}.checkout.internal.${ENV}.platform.pagopa.it/pagopa-checkout-auth-service`;

const authServiceURLs = {
    loginUrl: `${BASE_PATH}/auth/login?recaptcha=auth-service-recaptcha`,
    postTokenUrl: `${BASE_PATH}/auth/token`,
    validateUrl: `${BASE_PATH}/auth/validate`,
    getUsersUrl: `${BASE_PATH}/auth/users`,
    logoutUrl: `${BASE_PATH}/auth/logout`,
}

const k6Options = {
    stages: [
        { target: 1, duration: '1s' }, // 30 minuti per arrivare a 200 iterazioni / secondo
        { target: 1, duration: '1s' },  // 7 ore di traffico costante
        { target: 0, duration: '1s' },   // 30 minuti per arrivare da 200 a 0 iterazioni al secondo
    ],

    thresholds: {
        'http_req_duration': ['p(95)<2000'], // 95% of requests should be below 2s
        'http_req_failed': ['rate<0.01'],    // Less than 1% can fail
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
    });

    let redirectUrl = response.json('urlRedirect');

    logStep(1, "login request done", { redirectUrl })

    redirectUrl = transformOneIdentityRedirectUrl(redirectUrl)

    // 2) follow the redirect URL (One Identity)
    response = step2PerformLoginRedirect(redirectUrl)

    check(response, {
        'OIDC authorization is successful': (r) => r.status === 200,
    });

    const callbackAuthParams = extractCallbackAuthParam(response.body)
    
    logStep(2, "got callback auth params", {callbackAuthParams})

    check(callbackAuthParams, {
        'Callback URL authCode': ({ authCode }) => !!authCode,
        'Callback URL state': ({ state }) => !!state,
    })

    // 3) post token
    const { authCode, state } = callbackAuthParams

    response = step3PostToken(authCode, state)

    check(response, {
        'token request is successful': (r) => r.status === 200,
        'token response contains token': (r) => !!r.json('authToken'),
    });

    const authToken = response.json('authToken')

    logStep(3, "got auth token", { authToken })

    // 4) validate token
    response = step4ValidateToken(authToken)

    check(response, {
        'token is valid': (r) => r.status === 200,
    });

    // 5) get user info
    response = step5GetUsers(authToken)
    check(response, {
        'Get user request successful': (r) => r.status === 200,
        'Has userId in response': (r) => !!r.json('userId'),
        'Has name in response': (r) => !!r.json('name'),
        'Has familyName in response': (r) => !!r.json('familyName'),
    });

    logStep(5, "userId is", response.json('userId'))

    // 6) logout
    response = step6Logout(authToken)

    check(response, {
        'Logout successfully': (r) => r.status === 204,
    });

    iterationCounter.add(1);

    logStep(100, "k6 main function DONE")
}

/*** Helpers functions ***/

const step1PerformLogin = () => 
    http.get(
        authServiceURLs.loginUrl,
        { headers: { 'Content-Type': 'application/json' } }
    );

const step2PerformLoginRedirect = (redirectUrl) => http.get(redirectUrl);

const step3PostToken = (authCode, state) => 
    http.post(
        authServiceURLs.postTokenUrl,
        JSON.stringify({ authCode: authCode, state: state }),
        { headers: { 'Content-Type': 'application/json' }}
    )

const step4ValidateToken = (token) =>
    http.get(
        authServiceURLs.validateUrl,
        { headers: { 'Authorization': `Bearer ${token}` }}
    )

const step5GetUsers = (token) =>
    http.get(
        authServiceURLs.getUsersUrl,
        { headers: { 'Authorization': `Bearer ${token}` }}
    )

const step6Logout = (token) =>
    http.post(
        authServiceURLs.logoutUrl,
        null,
        { headers: { 'Authorization': `Bearer ${token}` }}
    )

/**
 * Transform the redirect URL to point to the ingress
 * 
 * @param {string} originalUrl 
 * @returns 
 */
function transformOneIdentityRedirectUrl(originalUrl) {
    // Parse the original URL
    const url = new URL(originalUrl);

    // Extract the environment from the hostname
    const envMatch = url.hostname.match(/api\.(\w+)\.platform\.pagopa\.it/);
    if (!envMatch) {
        throw new Error("Environment could not be determined from the URL");
    }
    const env = envMatch[1];

    const newHostname = `weu${env}.checkout.internal.${env}.platform.pagopa.it`;

    const newPath = url.pathname.replace(
        '/checkout/identity-provider-mock/v1/login',
        '/pagopa-checkout-identity-provider-mock/login'
    );

    const transformedUrl = `https://${newHostname}${newPath}${url.search}`;

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