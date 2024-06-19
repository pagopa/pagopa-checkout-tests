module.exports = {
    launch: {
        dumpio: true,
        headless: true,
        product: 'chrome',
        args: ["--no-sandbox"] // to fix
    },
    browserContext: 'incognito',
    exitOnPageError: false // for fe develop branch 
}