const express = require("express");
const app = express();
const port = 3000;

app.listen(port, () =>
  console.log(`Please app listening at http://localhost:${port}`)
);
app.use(express.json());
app.use(errorHandler);

// bot token auth
// const { WebClient } = require("@slack/web-api");
// const token = process.env.SLACK_TOKEN;
// const web = new WebClient(token);

// routes
app.post("/slack-events", function (req, res) {
  const data = req.body;

  if (data.event) {
    const event = data.event;
    handleMessage(event.text);
  }

  res.send(data.challenge);
});

// methods
function errorHandler(err, req, res, next) {
  res.status(500);
  res.send("error", { error: err });
}

function handleMessage(text) {
  const userID = getUserID(text);

  if (!userID) {
    // TODO handle missing user on request
    console.log("Request User to assign to here...");
  } else {
    // getTaskText(text);
    // TODO handle sending request to the user
    console.log("Gonna send a request to userid: ", userID);
  }
}

function getUserID(text) {
  const userIDRegex = /<@U[0-9A-Z]*\>/;
  const userIDRaw = text.match(userIDRegex);

  if (!userIDRaw) return null;

  return userIDRaw[0].slice(2, -1);
}

function getTaskText(text) {
  const taskText = text;
  // TODO get task text
  return taskText;
}
