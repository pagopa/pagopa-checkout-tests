module.exports = {
    launch: {
        dumpio: true,
        headless: "new",
        product: 'chrome',
        args: ["--no-sandbox"], // to fix,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    },
    browserContext: 'incognito'
}