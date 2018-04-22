const express = require('express');
const app = express();
const Twitter = require('twitter');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const session = require('express-session');
const myTwitter = require('./routes/myTwitter');
const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(logger('dev'));

// middleware for OAuth
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxage: 1000 * 60 * 10    // 10min
    }
}));
  
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});
  
passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
(token, tokenSecret, profile, done) => {
    process.nextTick(() => {
        profile['accessToken'] = token;
        profile['accessTokenSecret'] = tokenSecret;
        return done(null, profile);
    });
}));  

app.get('/', myTwitter.index);
app.post('/', myTwitter.indexWithScreenName);
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/'}), (req, res) => {
    res.redirect('/')
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
