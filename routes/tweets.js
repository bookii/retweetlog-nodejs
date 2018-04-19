const Twitter = require('twitter');
require('dotenv').config();

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

exports.index = (req, res) => {
    res.render('index');
};

exports.getUserTimeline = (req, res, next) => {
    if (req.params.screen_name) {
        console.log(screen_name);
        const params = {screen_name: req.body.screen_name};
        client.get('statuses/user_timeline', params, (error, tweet, response) => {
            if(!error) {
                res.send(tweet);
            }
        });
    }
};