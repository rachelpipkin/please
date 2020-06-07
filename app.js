const express = require('express');
const app = express();
const port = 3000;

const { WebClient } = require('@slack/web-api');
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

const emptyTask = {
  assignedID: '',
  requesterID: '',
  text: '',
};
const task = Object.assign({}, emptyTask);
const userIDRegex = /<@U[0-9A-Z]*\>/;

app.listen(port, () =>
  console.log(`Please app listening at http://localhost:${port}`)
);
app.use(express.json());
app.use(routeErrorHandler);

// routes
app.post('/slack-events', function (req, res) {
  const data = req.body;

  if (data.event) {
    const event = data.event;
    createRequest(event.text, event.user);
  }

  res.send(data.challenge);
});

// methods
function createRequest(text, user) {
  task.assignedID = getUserID(text);
  task.requesterID = user;

  if (task.assignedID == '') {
    // TODO handle missing user on request
    console.log('Request User to assign to here...');
  } else {
    task.text = getTaskText(text);
    sendTaskToAssigned();
  }
}

function getTaskText(text) {
  const userIDRaw = text.match(userIDRegex);
  const taskText = text.replace(userIDRaw, '');

  return taskText.trim();
}

function getUserID(text) {
  const userIDRaw = text.match(userIDRegex);

  if (!userIDRaw) return '';

  return userIDRaw[0].slice(2, -1);
}

function resetTask() {
  const task = Object.assign({}, emptyTask);
}

function routeErrorHandler(err, req, res, next) {
  res.status(500);
  res.send('error', { error: err });
}

async function sendTaskToAssigned() {
  const result = await web.chat.postMessage({
    text: `Would you please: ${task.text}`,
    channel: task.assignedID,
  });

  result.ok
    ? messageRequester('Task assigned')
    : messageRequester(`Uh oh! We got the following error: ${result.error}`);
}

function messageRequester(text) {
  web.chat.postMessage({
    text,
    channel: task.requesterID,
  });
}
