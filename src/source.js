const puppeteer = require('puppeteer');
const utils = require('./utils');

module.exports = (app) => {
    // get /source -> returns the html content
    app.get('/source', (req, res) => {
        let url = req.query.url;
        let ignoreSSLErrors = req.query.ignoreSSLErrors;

        if (!utils.validateUrl(url)) {
            return res.status(400).send('You must specify a valid URL, it must not be null and matches this regex : ' + process.env.allowed_domain);
        }

        let data = '';

        (async () => {
            try {
                const browser = await puppeteer.launch({
                    executablePath: '/usr/bin/google-chrome',
                    args: ['--no-sandbox'],
                    ignoreHTTPSErrors: ignoreSSLErrors,
                });
                const page = await browser.newPage();
                await page.setViewport({
                    width: 1440,
                    height: 900
                });

                const response = await page.goto(url, {waitUntil: 'networkidle2'});
                data = await response.text();

                await browser.close();
                res.setHeader('Content-Type', 'text/html');
                return res.send(data);
            } catch (ex) {
                return res.send(ex.toString())
            }
        })();
    });
}
