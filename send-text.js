const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const { batchText } = require("./helpers");

const config = require("./config.json");

const sendText = async (msg) => {
  const batches = batchText(msg, 1500);

  batches.forEach((batchedMessage) => {
    client.messages
      .create({
        body: batchedMessage,
        from: config.twilioFrom,
        to: config.twilioTo,
      })
      .then((message) =>
        console.log(`Text sent successfully. SID:`, message.sid)
      )
      .catch(console.error);
  });
};

module.exports = sendText;
