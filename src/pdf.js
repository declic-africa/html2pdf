const puppeteer = require("puppeteer");
const utils = require("./utils");
const bodyParser = require("body-parser");

var jsonParser = bodyParser.json();

const TIMEOUT = 60000;

const DEFAULT_VIEWPORT = {
  width: 1000,
  height: 2000,
  deviceScaleFactor: 1,
};

const browserOptions = {
  headless: true,
  ignoreHTTPSErrors: true,
  timeout: TIMEOUT,
  defaultViewport: DEFAULT_VIEWPORT,
  args: [
    // executablePath: "/usr/bin/google-chrome",
    "--no-sandbox",
    "--single-process",
    "--no-zygote"
  ],
  product: 'firefox'
};

module.exports = (app) => {
  // up limit payload
  app.use(bodyParser.json({ limit: "50mb" }));

  // post /pdf -> returns the PDF file
  app.get("/pdf", async (req, res) => {
    try {
      let url = req.query.url;
      let media = req.query.media === "print" ? "print" : "screen";
      let islandscape = req.query.landscape > 0;
      let ignoreSSLErrors = req.body.ignoreSSLErrors > 0;

      if (!utils.validateUrl(url)) {
        return res
          .status(400)
          .send(
            "You must specify a valid URL, it must not be null and matches this regex : " +
              process.env.allowed_domain
          );
      }

      const browser = await puppeteer.launch(browserOptions);

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle0", timeout: TIMEOUT });
      await page.emulateMediaType(media);
      let opts = {
        format: "A2",
        printBackground: true,
        landscape: islandscape,
      };
      const pdfFile = await page.pdf(opts);
      await browser.close();
      res.setHeader("Content-Type", "application/pdf");
      return res.send(pdfFile);
    } catch (ex) {
      return res.send(ex.toString());
    }
  });

  //-------------------------------POST------------------------------

  app.post("/pdf", jsonParser, async (req, res) => {
    let url = req.body.url;
    let html = req.body.html;
    let media = req.body.media === "print" ? "print" : "screen";
    let printBackground = req.body.printBackground !== false;
    let islandscape = req.body.landscape > 0;
    let margin = req.body.margin;
    let headerTemplate = req.body.headerTemplate;
    let footerTemplate = req.body.footerTemplate;
    let ignoreSSLErrors = req.body.ignoreSSLErrors > 0;

    if (url !== undefined && !utils.validateUrl(url)) {
      return res
        .status(400)
        .send(
          "You must specify a valid URL, it must not be null and matches this regex : " +
            process.env.allowed_domain
        );
    }

    console.log(url);

    try {
      const browser = await puppeteer.launch(browserOptions);
      const page = await browser.newPage();
      if (url !== undefined) {
        await page.goto(url, { waitUntil: "networkidle0", timeout: TIMEOUT });
        await page.emulateMediaType(media);
      } else if (html !== undefined) {
        await page.setContent(html);
      }

      let opts = {
        format: "A2",
        printBackground: printBackground,
        landscape: islandscape,
        // margin: margin,
        headerTemplate: headerTemplate,
        footerTemplate: footerTemplate,
        displayHeaderFooter:
          headerTemplate !== undefined || footerTemplate !== undefined,
      };

      const pdfFile = await page.pdf(opts);
      await browser.close();
      res.setHeader("Content-Type", "application/pdf");
      return res.send(pdfFile);
    } catch (ex) {
      return res.send(ex.toString());
    }
  });
};
