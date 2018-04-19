const express = require('express');
const app = express();
const Twitter = require('twitter');
const client = require('./routes/tweets');
const logger = require('morgan');
const PORT = process.env.PORT || 5000

app.use(logger('dev'));

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/home', client.getUserTimeline);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
