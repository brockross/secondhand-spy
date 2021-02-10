const fs = require("fs");
const chalk = require("chalk");

const logger = (context, ...args) => {
  console.log(chalk.blue(`${context.toUpperCase()} | `, ...args));
};

const getCookies = (filePath) => {
  if (fs.existsSync(filePath)) {
    const cookies = fs.readFileSync(filePath);
    return JSON.parse(cookies);
  }
  return null;
};

const getPrevListings = (filePath) => {
  if (fs.existsSync(filePath)) {
    const prevListings = fs.readFileSync(filePath);
    return JSON.parse(prevListings);
  }
  return null;
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
  getCookies,
  getPrevListings,
  batchText,
};
