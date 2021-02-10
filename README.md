# secondhand spy

A node app that watches "for sale" sites (like Craigslist or Nextdoor) for a search query and notifies you of new listings

## Installation

Pull down the repo and run `yarn`. Or you can use `npm install` if you want; I'm not your dad probably

## Setup

Copy the example config file:

```
cp config.example.json config.json
```

Set up `config.json` with main app settings, using the `sitesToWatch` field for any sites you want to watch. Like so:

```
{
  "sitesToWatch": [
    {
      "name": "Craigslist", // used for reference; this can be whatever you want
      "needsLogin": false, // whether site is behind a login
      "searchConfig": {
        "searchUrl": "https://boise.craigslist.org/search/sss", // main search url
        "appendedQueryParams": ["srchType=T"], // query params to narrow or modify search as desired. Optional; can be left empty. This example tells Craigslist to only search within titles, not descriptions, and yields more relevant results
        "linksSelector": ".result-title", // css selector for anchor tag--app will grab hrefs from here
        "titlesSelector": null // css selector for listing titles--app will grab innerHTML from here. Craigslist's links and titles are one and the same so this is null
      }
    },
    {
      "name": "Nextdoor",
      "needsLogin": true,
      "loginConfig": {
        "loginUrl": "https://nextdoor.com/login", // login page for the site
        "username": "", // if you know you know
        "pw": "", // hunter2 (markdown converted that to asterisks right?)
        "usernameSelector": "#id_email", // css selector for username input field
        "pwSelector": "#id_password", // css selector for password input field
        "submitSelector": "#signin_button", // css selector for login submit button
        "successSelector": ".avatar-image" // some css selector on main site page that signifies you've successfully logged in
      },
      "searchConfig": {
        "searchUrl": "https://nextdoor.com/for_sale_and_free",
        "appendedQueryParams": [],
        "linksSelector": ".classified-item-card-container",
        "titlesSelector": ".classified-item-card-title"
      }
    }
  ],
  "shouldSendMessages": false, // toggle sending new listing notifications via text. Requires free twilio account. If this is false new listings just get logged to the console
  "twilioFrom": "", // twilio account phone number
  "twilioTo": "", // phone number notification texts will be sent to
  "runHeadless": true, // if false, puppeteer will open a chromium browser so you can watch navigation
}
```

## Usage

To start it up, run:

```
yarn watch itemYouWantToSearch
```

... and that's it! The cron schedule is hardcoded to run every minute at :00.
When the app has errors, debug them.

To take the app for a single-run spin with no recurring interval, use

```
yarn watch-once itemYouWantToSearch
```

## Notification texts through twilio

Run:

```
cp .env.example .env
```

Then add Twilio API key deets to `.env`, then set phone numbers and `shouldSendMessages` in `config.json`.
