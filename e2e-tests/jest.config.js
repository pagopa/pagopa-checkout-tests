module.exports = {
    preset: "jest-puppeteer",
    testRegex: ".*\\.integration\\.test\\.ts$",
    reporters: [
        'default',
        [ 'jest-junit', {
            outputDirectory: './test_reports',
            outputName: `checkout-${new Date().toISOString()}-ui-TEST.xml`
        } ]
      ]
};