// const express = require('express');
const app = require('../app');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const session = require('express-session');
require('dotenv').config();

// middleware for OAuth
app.set('trust proxy', 1);
let sess = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxage: 1000 * 60 * 10    // 10min
    }
}
if (app.get('env') === 'production') {
    sess.cookie.secure = true;
}
app.use(session(sess));

app.use(passport.initialize());
app.use(passport.session());
  
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

exports.signIn = passport.authenticate('twitter');

exports.redirect = passport.authenticate('twitter', {successRedirect: '/', failureRedirect: '/'}), (req, res) => {res.redirect('/')};