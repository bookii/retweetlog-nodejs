const express = require('express');
const app = module.exports = express();
const Twitter = require('twitter');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const myOAuth = require('./routes/myOAuth');
const myTwitter = require('./routes/myTwitter');
const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(logger('dev'));

app.get('/', myTwitter.index);
app.post('/', myTwitter.indexWithScreenName);
app.get('/about', myTwitter.about);
app.get('/auth/twitter', myOAuth.signIn);
app.get('/auth/twitter/callback', myOAuth.redirect);
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
