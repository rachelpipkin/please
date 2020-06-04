const express = require("express");
const app = express();
const port = 3000;

app.listen(port, () =>
  console.log(`Please app listening at http://localhost:${port}`)
);
app.use(express.json());

// routes
app.post("/slack", function (req, res) {
  // const data = res.json(req.body);
  const data = req.body;
  console.log(data);
  res.send(data.challenge);
});

// bot token auth
const { WebClient } = require("@slack/web-api");
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);
