module.exports = {
    testRegex: "./*.test\\.js$",
    reporters: [
        'default',
        [ 'jest-junit', {
          outputDirectory: './test_reports',
          outputName: 'io-pay-ui-TEST.xml',
        } ]
      ]
    };