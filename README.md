# pagopa-checkout-tests

This repository contains both api test and e2e test 
used to perform integration tests for Checkout and eCommerce products.

Tests can be found under api-tests and e2e folders.

Api tests consists of postman collections that can be run using newman using the following command

## Run api tests locally
```sh
COLLECTION_FILE=path-to-collection-test-file
COLLECTION_ENV=path-to-collection-env-test-file
REPORT_FILE_NAME=report-file-name
newman run --ignore-redirects $COLLECTION_FILE --environment=$COLLECTION_ENV --reporters cli,junit --reporter-junit-export Results/$REPORT_FILE_NAME
```

Changing the above env variables you can run any postman collection test that you find into the api-tests folder.

For example, in order to run carts tests for dev environment the above script will become:

```sh
COLLECTION_FILE=./api-tests/cart-tests/cart-api-uat.tests.json
COLLECTION_ENV=./api-tests/dev.envs.json
REPORT_FILE_NAME=carts-report-file.xml
newman run --ignore-redirects $COLLECTION_FILE --environment=$COLLECTION_ENV --reporters cli,junit --reporter-junit-export Results/$REPORT_FILE_NAME
```

## Run end-to-end locally

End-to-end tests are executed using puppeteers.
Test execution will launch a Chrome instance locally and simulate user interactions and perform checks
against expected front end behaviour.

Tests have been split for DEV and UAT environment since those environment use different inputs (card number, f.e)
and have different implementations due to different payment gateway integrations (dev: NPG vs uat: PGS).

Test can be run using the following script:
```sh
cd e2e-tests
rm -f .env && cp <environment>.env .env
yarn install && yarn test
```
Make sure locally node version matches the `./e2e-tests/.nvmrc` ones.

If you have `nvm` this can be done with the following command:
```sh
cd e2e-tests && nvm use
```

In order to run tests for dev environment the above command will become:
```sh
cd e2e-tests
rm -f .env && cp dev.env .env
yarn install && yarn test
```

Tests are executed in `headless` mode, meaning that no Chrome window will be visible during test execution.

During tests writing, or to investigate tests failure, enabling visual mode can be useful.

This can be achieved modifying the `./e2e-tests/jest-puppeteer.config.js` file disabling `headless` parameter.

This configuration file will become:

```
module.exports = {
    launch: {
        dumpio: true,
        headless: false, //--> change here from true to false
        product: 'chrome',
        args: ["--no-sandbox"] 
    },
    browserContext: 'incognito'
}
```

## Execute end-to-end tests in azure pipelines

This project contains a template that can be used to execute end-to-end tests during azure pipeline execution.
For example, those tests have been included into infra eCommerce domain IAC pipeline after a domain-app apply.

Template is stored under `.devops/azure-templates/e2e-tests.yaml`

For pipeline integration first is required to pagopa/pagopa-checkout-tests repository checkout.

This can be done adding this repo to pipeline resources with:

```yaml
resources:
  repositories:
    - repository: checkoutTests
      type: github
      name: pagopa/pagopa-checkout-tests
      ref: main
      endpoint: 'endpoint configuration'
```

The repository used name, then, will be used as `CHECKOUT_RESOURCE_REPO_NAME` parameter value

Once add this repository to pipeline repository section, e2e test template can be used as follows:

```yaml
  - stage: E2E_Tests_Checkout
    pool:
      vmImage: 'ubuntu-latest'
    dependsOn: Setup_Project
    jobs:
      - job: e2e_tests
        steps:
          - template: azure-templates/e2e-tests.yaml@checkoutTests
            parameters:
              ENVIRONMENT: DEV
              CHECKOUT_RESOURCE_REPO_NAME: checkoutTests
```
for perform e2e test for DEV environment.

Template parameters:

| Parameter key                | Type   | Description                                             |
|------------------------------|--------|---------------------------------------------------------|
| ENVIRONMENT                  | string | Environment for which execute e2e test (DEV or UAT)     |
| CHECKOUT_RESOURCE_REPO_NAME  | string | The name used during checkout-tests repository checkout |