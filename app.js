const express = require('express');
const app = express();
const port = 3000;

const task = require('./task.js');

app.listen(port, () =>
  console.log(`Please app listening at http://localhost:${port}`)
);
app.use(express.json());
app.use(_errorHandler);

app.post('/slack-events', function (req, res) {
  const data = req.body;

  if (data.event) {
    const event = data.event;

    // ignore bot events
    if (event.bot_id) return;

    //handle events
    task.handleTaskEvent(event);
  }

  res.send(data.challenge);
});

function _errorHandler(err, req, res, next) {
  res.status(500);
  res.send('error', { error: err });
}
