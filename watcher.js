const puppeteer = require("puppeteer");
const fs = require("fs");

const logIn = require("./login.js");
const { logger, getPrevListings } = require("./helpers");
const sendText = require("./send-text.js");

const config = require("./config.json");

const watch = async (
  searchTerm,
  { name, needsLogin, loginConfig, searchConfig },
  shouldSendMessages
) => {
  return new Promise(async (resolve, reject) => {
    // init browser
    const browser = await puppeteer.launch({ headless: config.runHeadless });
    const context = browser.defaultBrowserContext();
    const siteHostname = new URL(searchConfig.searchUrl).hostname;
    context.overridePermissions(`https://${siteHostname}`, []);

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    // page.on("console", (msg) => console.log("FROM PAGE:", msg.text()));

    // log in
    if (needsLogin) {
      try {
        await logIn(page, name, loginConfig);
        logger(name, `Logged in!`);
      } catch (error) {
        logger(name, `error in login step: `, error);
        reject(error);
        // TODO on all these catch blocks, figure out a way to gracefully handle the error for the current watcher w/o terminating whole process
      }
    }

    // nav to For Sale search page. Query params set search term
    await page.goto(
      `${
        searchConfig.searchUrl
      }/?query=${searchTerm}&${searchConfig.appendedQueryParams.join("&")}`,
      {
        waitUntil: "domcontentloaded",
      }
    );
    try {
      await page.waitForSelector(searchConfig.linksSelector);
      await page.waitForTimeout(5000);
    } catch (error) {
      logger(name, `no results found for "${searchTerm}" search.`);
      reject(error);
      // TODO exit gracefully -- lack of search results is not an error; just finish and wait for next interval
    }

    // get all search results
    const listings = await page.evaluate(
      ({ searchConfig }) => {
        const selection = document.querySelectorAll(searchConfig.linksSelector);

        const listings = {};

        selection.forEach((qsaSelection) => {
          console.log(`***debug | qsaSelection: `, qsaSelection);
          const title = searchConfig.titlesSelector
            ? qsaSelection.querySelectorAll(searchConfig.titlesSelector)[0]
                .innerHTML
            : qsaSelection.innerHTML;
          const href = qsaSelection.href;
          const key = title.toUpperCase();

          listings[key] = { title, href };
        });

        return listings;
      },
      { searchConfig }
    );

    logger(
      name,
      `"${searchTerm}" search results count: `,
      Object.keys(listings).length
    );

    // compare to results of last run
    const listingsPath = `./data/${name}-${searchTerm}-prev-listings.json`;
    const prevListings = getPrevListings(listingsPath);

    const newItems = Object.keys(listings)
      .map((key) => {
        const newListing = listings[key];
        const oldListing = prevListings?.[key];
        if (!oldListing) {
          logger(
            name,
            `new listing for ${name}!
            title: ${newListing.title}
            link: ${newListing.href}
          `
          );
          return newListing;
        }
      })
      .filter(Boolean);

    // write current listings to disk
    fs.writeFileSync(listingsPath, JSON.stringify(listings));

    // if there are new items, send a text
    if (newItems.length) {
      const prettyItems = newItems
        .map(({ title, href }) => {
          return `Title: ${title} - Link: ${href}`;
        })
        .join("\n");
      const msg = `
        --------
        New items on ${name} for "${searchTerm}" search!
        ${prettyItems}
      `;

      if (config.shouldSendMessages) {
        await sendText(msg);
      } else {
        logger(name, `Message sending set to false; placeholder log: `, msg);
      }
    }

    logger(name, "Done.");
    // browser.close();
  });
};

module.exports = watch;
