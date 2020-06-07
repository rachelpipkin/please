const { WebClient } = require('@slack/web-api');
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

const emptyTask = {
  assignedID: '',
  requesterID: '',
  text: '',
};
let task = Object.assign({}, emptyTask);
const userIDRegex = /<@U[0-9A-Z]*\>/;

module.exports = function (event) {
  event.user === task.assignedID
    ? respondToTask(event.text)
    : createTask(event.text, event.user);
};

function createTask(text, user) {
  task.assignedID = task.assignedID ? task.assignedID : getUserID(text);
  task.requesterID = user;
  task.text = task.text ? task.text : getTaskText(text);

  if (!task.assignedID) {
    messageRequester('What user would you like to assign this to?');
  } else if (!task.text) {
    messageRequester(`What would you like <@${task.assignedID}> to do?`);
  } else {
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

function messageAssigned(text) {
  return web.chat.postMessage({
    text,
    channel: task.assignedID,
  });
}

function messageRequester(text) {
  return web.chat.postMessage({
    text,
    channel: task.requesterID,
  });
}

function resetTask() {
  task = Object.assign({}, emptyTask);
}

async function respondToTask(text) {
  if (text.toLowerCase().trim() === 'done') {
    const result = await messageRequester(
      `<@${task.assignedID}> has completed your request to ${task.text}`
    );

    if (result.ok) {
      messageAssigned(`Great! I'll let <@${task.requesterID}> know.`);
      resetTask();
    } else {
      messageAssigned(`Hmmm... I can't seem to reach <@${task.requesterID}>`);
    }
  } else {
    messageAssigned(`Need to follow up with <@${task.requesterID}>?`);
  }
}

async function sendTaskToAssigned() {
  const result = await messageAssigned(
    `<@${task.requesterID}> would like you to please ${task.text}\n\nRespond with 'done' when you're finished.`
  );

  result.ok
    ? messageRequester(`Task assigned to <@${task.assignedID}>`)
    : messageRequester(`Uh oh! We got the following error: ${result.error}`);
}
