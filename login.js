const fs = require("fs");
const { logger, getCookies } = require("./helpers");

const logIn = async (
  page,
  name,
  {
    loginUrl,
    usernameSelector,
    pwSelector,
    submitSelector,
    successSelector,
    username,
    pw,
  }
) => {
  const cookiesKey = loginUrl.replace(/\W/g, "");
  const cookiesPath = `./cookies/${cookiesKey}.json`;
  const cookies = getCookies(cookiesPath);

  if (!cookies) {
    logger(name, `Loading login page...`);
    await page.goto(loginUrl, {
      waitUntil: "networkidle2",
    });

    await page.type(usernameSelector, username, { delay: 30 });
    await page.type(pwSelector, pw, { delay: 30 });
    await page.click(submitSelector);

    logger(name, `Logging in...`);
    await page.waitForNavigation({ waitUnil: "networkidle0" });
    await page.waitForTimeout(5000);

    try {
      await page.waitForSelector(successSelector);
      logger(name, `Logged in successfully.`);
    } catch (error) {
      logger(name, `Error trying to log in.`);
      throw new Error(error);
    }

    let currentCookies = await page.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(currentCookies));
    return "success";
    // TODO figure out the right way to signify success in a promisey way
  } else {
    //cookie auth
    logger(name, `Authenticating with cookies...`);
    await page.setCookie(...cookies);
    return;
  }
};

module.exports = logIn;
