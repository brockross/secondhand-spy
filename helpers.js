const fs = require("fs");
const chalk = require("chalk");

const logger = (context, ...args) => {
  console.log(chalk.blue(`${context.toUpperCase()} | `, ...args));
};

const setCookies = (filePath, cookies) => {
  if (!fs.existsSync("./cookies")) {
    fs.mkdirSync("./cookies");
  }
  fs.writeFileSync(filePath, cookies);
};

const getCookies = (filePath) => {
  if (!fs.existsSync("./cookies")) {
    fs.mkdirSync("./cookies");
  }
  if (fs.existsSync(filePath)) {
    const cookies = fs.readFileSync(filePath);
    return JSON.parse(cookies);
  }
  return null;
};

const getPrevListings = (filePath) => {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  if (fs.existsSync(filePath)) {
    const prevListings = fs.readFileSync(filePath);
    return JSON.parse(prevListings);
  }
  return null;
};

const setNewListings = (filePath, listings) => {
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  fs.writeFileSync(filePath, listings);
};

const batchText = (text, batchSize = 1500) => {
  const batches = [];

  for (let i = 0; i < text.length; i += batchSize) {
    const batch = text.substring(i, i + batchSize);
    batches.push(batch);
  }

  return batches;
};

module.exports = {
  logger,
  setCookies,
  getCookies,
  getPrevListings,
  setNewListings,
  batchText,
};
