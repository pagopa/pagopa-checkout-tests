module.exports = {
  preset: "jest-puppeteer",
  testRegex: "./*test\\.(t|j)s$",
  reporters: [
    'default',
    [ 'jest-junit', 
      {
        outputDirectory: './test_reports',
        outputName: 'checkout-ui-TEST.xml',
      } 
    ]
  ]
};