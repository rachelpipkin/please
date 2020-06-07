const slack = require('./slack-web-api.js');

const emptyTask = {
  assignedID: '',
  requesterID: '',
  text: '',
};
let task = Object.assign({}, emptyTask);
const userIDRegex = /<@U[0-9A-Z]*\>/;

function handleTaskEvent(event) {
  event.user === task.assignedID
    ? _respondToTask(event.text)
    : _createTask(event.text, event.user);
}

function _createTask(text, requester) {
  task.assignedID = task.assignedID ? task.assignedID : _getUserID(text);
  task.requesterID = requester;
  task.text = task.text ? task.text : _getTaskText(text);

  if (!task.assignedID) {
    slack.messageUser({
      text: 'What user would you like to assign this to?',
      channel: task.requesterID,
    });
  } else if (!task.text) {
    slack.messageUser({
      text: `What would you like <@${task.assignedID}> to do?`,
      channel: task.requesterID,
    });
  } else {
    _sendTaskToAssigned(task);
  }
}

function _getTaskText(text) {
  const userIDRaw = text.match(userIDRegex);
  const taskText = text.replace(userIDRaw, '');

  return taskText.trim();
}

function _getUserID(text) {
  const userIDRaw = text.match(userIDRegex);

  if (!userIDRaw) return '';

  return userIDRaw[0].slice(2, -1);
}

function _resetTask() {
  task = Object.assign({}, emptyTask);
}

async function _respondToTask(text) {
  if (text.toLowerCase().trim() === 'done') {
    const result = await slack.messageUser({
      text: `<@${task.assignedID}> has completed your request to ${task.text}`,
      channel: task.requesterID,
    });

    if (result.ok) {
      slack.messageUser({
        text: `Great! I'll let <@${task.requesterID}> know.`,
        channel: task.assignedID,
      });
      _resetTask();
    }
  } else {
    slack.messageUser({
      text: `Need to follow up with <@${task.requesterID}>?`,
      channel: task.assignedID,
    });
  }
}

async function _sendTaskToAssigned(task) {
  const result = await slack.messageUser({
    text: `<@${task.requesterID}> would like you to please ${task.text}\n\nRespond with 'done' when you're finished.`,
    channel: task.assignedID,
  });

  if (result.ok)
    slack.messageUser({
      text: `Task assigned to <@${task.assignedID}>`,
      channel: task.requesterID,
    });
}

exports.handleTaskEvent = handleTaskEvent;
