// dependency imports
const cron = require("node-cron");
const chalk = require("chalk");
require("dotenv").config();
const program = require("commander");

// local imports
const watch = require("./watcher");
const config = require("./config.json");
const siteConfigs = config.sitesToWatch;

// arg parsing; env setup
program
  .option("-o, --once", "run watcher once instead of on a cron schedule")
  .option("-t, --searchTerm <term>", "search term to watch results for");
program.parse(process.argv);
const options = program.opts();

const searchTerm = options.searchTerm || "treadmill";

// start yer engines
console.log(chalk.green.bold("the machine rumbles to life..."));

siteConfigs.forEach((siteConfig) => {
  if (options.once) {
    watch(searchTerm, siteConfig).catch(console.error);
  } else {
    const CRON_STRING = "* * * * *";
    console.log(
      `scheduling ${siteConfig.name} with following cron setting: `,
      CRON_STRING
    );
    cron.schedule(CRON_STRING, () => {
      watch(searchTerm, siteConfig).catch(console.error);
    });
  }
});

/* 
TODO:
- better solution for prepending all logs w/site name context--don't like passing "name" arg to all functions just to display in log output. Feels like something that should be established in a more global context
- put cron settings in a config; fall back to some default.
- handle cookies more intelligently--if they don't work, delete the file and start login step over with regular login process
- init some env variables associated w/each config--use them to provide different output color for each site
- more error handling
- there aren't actually that many secondhand listing sites right? So maybe it makes less sense to optimize for versatility at the expense of fine-tuning, and makes more sense to hardcode specialized handling of a few common sites like craigslist, ksl, nextdoor, etc. Then it can work REALLY well for a few likely cases instead of pretty well for 'all' cases
- ksl & FB already have "alert me" functionality so....
- set up for friendlier sharing--README, .env.example and .config.example
*/
