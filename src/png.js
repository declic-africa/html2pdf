const fs = require('fs');
const puppeteer = require('puppeteer');
const utils = require('./utils');

module.exports = (app) => {
    // post /png -> returns the PNG image
    app.get('/png', (req, res) => {
        let url = req.query.url;
        let ignoreSSLErrors = req.query.ignoreSSLErrors;

        if (!utils.validateUrl(url)) {
            return res.status(400).send('You must specify a valid URL, it must not be null and matches this regex');
        }

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
                await page.goto(url, {waitUntil: 'networkidle2'});
                let pngFile = await page.screenshot({fullPage: true});
                await browser.close();

                res.setHeader('Content-Type', 'image/png');
                return res.send(pngFile);
            } catch (ex) {
                return res.status(400)(ex.toString());
            }
        })();
    });
}
