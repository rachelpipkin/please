const { WebClient } = require('@slack/web-api');
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

async function messageUser(message) {
  const result = await web.chat.postMessage({ ...message });

  if (!result.ok) handleError(message.channel);

  return result;
}

function handleError(channel) {
  slack.messageUser({
    text: `Uh oh! We got the following error: ${result.error}`,
    channel: task.requesterID,
  });
}

exports.messageUser = messageUser;
