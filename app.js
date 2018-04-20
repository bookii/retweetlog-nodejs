const express = require('express');
const app = express();
const Twitter = require('twitter');
const bodyParser = require('body-parser');
const client = require('./routes/client');
const logger = require('morgan');
const PORT = process.env.PORT || 5000

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(logger('dev'));

app.get('/', client.index);
app.post('/', client.indexWithId);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
