module.exports = {
    preset: "jest-puppeteer",
    testRegex: testRegex(),
    reporters: [
        'default',
        [ 'jest-junit', {
          outputDirectory: './test_reports',
          outputName: `checkout-${process.env.PAYMENT_GATEWAY}-ui-TEST.xml`,
        } ]
      ]
      };

function testRegex() {
    const paymentGateway = process.env.PAYMENT_GATEWAY
    switch (paymentGateway) {
      case "PGS": 
        return "./*pgs.integration.test\\.ts$"
      case "NPG": 
        return "./*npg.integration.test\\.ts$"
      default: 
        throw new Error(`Error while execute test for PAYMENT_GATEWAY: ${paymentGateway}`)
    }
}