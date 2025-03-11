const { Cluster } = require('puppeteer-cluster');

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,  // Concorrenza per pagina
        maxConcurrency: 50,  // Limite massimo di pagine aperte contemporaneamente
        puppeteerOptions: {
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
    });

    const startCurrentTime = new Date().toLocaleString();
    console.log(`Test started. Current time: ${startCurrentTime}`);

    // Esegui una volta un task per ogni pagina
    const numPages = 50;  // Numero di pagine da mantenere aperte

    // Carica la pagina nelle prime 10 tab
    await cluster.task(async ({ page }) => {
        await page.setViewport({ width: 911, height: 856 });
        await page.goto('https://uat.checkout.pagopa.it/');
        
        // Esegui altre azioni di navigazione come login
        await Promise.all([
            page.waitForSelector('#login-header button'),
            page.click('#login-header button')
        ]);
    });

    // Coda le richieste per essere eseguite sulle stesse pagine
    const requestsPerSecond = 100;
    const interval = 1000 / requestsPerSecond; // Tempo tra ogni richiesta (~50ms)

    let requestCount = 0;
    const testDuration = 1 * 1000; // Test per 10 secondi

    const intervalId = setInterval(() => {
        // Coda la stessa azione su ogni pagina
        for (let i = 0; i < numPages; i++) {
            cluster.queue();
        }
        requestCount++;
    }, interval);

    setTimeout(async () => {
        clearInterval(intervalId);  // Ferma l'invio di richieste
        await cluster.idle();
        await cluster.close();
        const currentTime = new Date().toLocaleString();
        console.log(`Test completed: ${requestCount} requests sent. Current time: ${currentTime}`);
    }, testDuration);

})();
