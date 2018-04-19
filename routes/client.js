const Twitter = require('twitter');
require('dotenv').config();

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const showUser = (screen_name) => {
    const params = {screen_name: screen_name};
    client.get('users/show', params, (error, profile, response) => {
        if(!error) {
            console.log(profile);
        } else {
            console.log(error);
        }
    });
};

const oembed = (retweeted_status) => {
    const lang = retweeted_status['lang'];
    const text = retweeted_status['text'];
    const name = retweeted_status['user']['name'];
    const screenName = retweeted_status['user']['screen_name'];
    const idStr = retweeted_status['id_str'];
    const createdAt = retweeted_status['created_at'];
    const html = `<blockquote class="twitter-tweet" data-lang="ja"><p lang="${lang}" dir="ltr">${text}</p>&mdash; ${name} (@${screenName}) <a href="https://twitter.com/mizuff_k/status/${idStr}">${createdAt}</a></blockquote>`
    return html;
};

exports.index = (req, res) => {
    res.render('index', { items: [] });
};

exports.getRetweetedTweets = (req, res, next) => {
    if (req.body.screen_name.length > 0) {
        const params = {screen_name: req.body.screen_name};
        client.get('statuses/user_timeline', params, (error, tweets, response) => {
            if (!error) {
                const retweetedStatuses = tweets.map(tweet => tweet['retweeted_status']).filter(tweet => tweet);
                const retweetedStatusesHTML = retweetedStatuses.map(oembed);
                res.render('index', { items: retweetedStatusesHTML });
            } else {
                const errorMessage = [ error['message'] || error[0]['message'] ];  // HTTP Error || others
                res.render('index', { items: errorMessage });
            }
        });
    } else {
        res.render('index', { items: [ 'Please enter a TwitterID.' ] });
    }
};