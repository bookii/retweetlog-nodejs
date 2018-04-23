// const express = require('express');
const app = require('../app');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const cookieSession = require('cookie-session');
require('dotenv').config();

// middleware for OAuth
app.use(cookieSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    // saveUninitialized: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 10    // 10min
}));
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