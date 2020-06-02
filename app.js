const http = require("http");
const hostname = "127.0.0.1";
const port = 3000;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("ok");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// bot token auth
const { WebClient } = require("@slack/web-api");
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);
