module.exports = {
  launch: {
    dumpio: true,
    // slowMo: 10,
    headless: true,
    product: 'chrome',
    args: ["--no-sandbox"] // to fix
  },
  browserContext: 'incognito'
}