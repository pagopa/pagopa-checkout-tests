import { browser } from 'k6/browser';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    checkout: {
      executor: 'shared-iterations',
      exec: 'checkout',
      vus: 5,
      iterations: 1000,
      maxDuration: '120s',
      options: {
        browser: {
            type: 'chromium',
        },
      }
    }
  },
};


/**
 * Performs the checkout process by navigating to the checkout page and attempting to log in.
 * 
 * @async
 * @function checkout
 * @returns {Promise<void>} A promise that resolves when the checkout process is complete.
 * 
 * @example
 * // Example usage:
 * checkout().then(() => {
 *   console.log('Checkout process completed');
 * }).catch((error) => {
 *   console.error('Error during checkout process:', error);
 * });
 * 
 * @description
 * This function opens a new browser context and navigates to the checkout page. It then attempts to log in by clicking the login button.
 * The login steps involving SPID authentication are commented out and can be enabled if needed.
 * 
 * @remarks
 * - The function uses a timeout of 15000 milliseconds for the browser context.
 * - The function currently only clicks the login button and does not complete the full login process.
 * - The commented-out code includes steps for SPID authentication and verification of successful login.
 */
export async function checkout() {
    const context = await browser.newContext({
        timeout: 15000,
      args: [
        'no-sandbox'
      ],
    });

  
    const  page = await context.newPage();
  
    try {
      await page.goto('https://uat.checkout.pagopa.it/');
  
      //Clicca su "Accedi"
      await page.waitForSelector('#login-header button');
      await page.locator('#login-header button').click();
      // Clicca su "Entra con SPID"
      // await page.waitForSelector('[data-testid="idp-button-https://validator.dev.oneid.pagopa.it/demo"]');
      // await page.locator('[data-testid="idp-button-https://validator.dev.oneid.pagopa.it/demo"]').click();
  
      // // Inserisci username e password
      // await page.waitForSelector('#username');
      // await page.locator('#username').type('oneidentity');
  
      // await page.waitForSelector('#password');
      // await page.locator('#password').type('password123');
  
      // // Clicca "Entra con SPID"
      // await page.waitForSelector('span.italia-it-button-text');
      // await page.locator('span.italia-it-button-text').click();
  
      // // Conferma accesso
      // await page.waitForSelector("form:nth-of-type(1) > input[type='submit']");
      // await page.locator("form:nth-of-type(1) > input[type='submit']").click();
  
      // // Verifica se il login è riuscito
      // await page.waitForFunction(() => document.readyState === 'complete');
      // check(page, {
      //   'Login completato': () => page.url().includes('dashboard'),
      // });
  
    } finally {
      await page.close();
    }
}