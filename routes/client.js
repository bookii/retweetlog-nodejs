const Twitter = require('twitter');
require('dotenv').config();

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const oembed = retweetedStatus => {
    const lang = retweetedStatus['lang'];
    const text = retweetedStatus['text'];
    const name = retweetedStatus['user']['name'];
    const screenName = retweetedStatus['user']['screen_name'];
    const idStr = retweetedStatus['id_str'];
    const createdAt = retweetedStatus['created_at'];
    const html = `<blockquote class="twitter-tweet" data-lang="ja"><p lang="${lang}" dir="ltr">${text}</p>&mdash; ${name} (@${screenName}) <a href="https://twitter.com/mizuff_k/status/${idStr}">${createdAt}</a></blockquote>`
    return html;
};

const rateLimitStatus = () => {
    return new Promise(resolve => {
        const params = {resources: 'statuses'};
        client.get('application/rate_limit_status', params, (error, object, response) => {
            if (!error) {
                resolve(object['resources']['statuses']['/statuses/user_timeline']);
            } else {
                resolve(null);
            }
        });
    });
};

const getUserTimeline = (screenName, maxId) => {
    return new Promise((resolve, reject) => {
        let params = {screen_name: screenName, count: 200};
        if (maxId) {
            params['max_id'] = maxId;
        }
        client.get('statuses/user_timeline', params, (error, tweets, response) => {
            if(!error) {
                resolve(tweets);
            } else {
                console.log(error);
                reject([error['message'] || error[0]['message']]);
            }
        });
    });
};

const getUser = (screenName) => {
    return new Promise((resolve, reject) => {
        client.get('users/show', {screen_name: screenName}, (error, profile, response) => {
            if(!error) {
                resolve(profile);
            } else {
                reject([error[0]['message']]);
            }
        })
    });
};

const getRetweets = screenName => {
    return new Promise(async (resolve, reject) => {
        let retweets = [];
        let maxId = null
        try {
            while(true) {
                tweets = await getUserTimeline(screenName, maxId);
                if (tweets.length > 1) {
                    console.log('LENGTH: ' + tweets.length);
                    maxId = tweets[tweets.length-1]['id'] - 1;
                    Array.prototype.push.apply(retweets, tweets.map(tweet => tweet['retweeted_status']).filter(tweet => tweet));
                } else {
                    break;
                }
            } 
        } catch (error) {
            reject(error);
        }
        resolve(retweets);
    });
};

exports.index = async (req, res) => {
    res.render('index', { items: [], rateLimitStatus: await rateLimitStatus() });
};

exports.indexWithId = async (req, res) => {
    params = {items: null}
    // const tweets = await getRetweetedTweets(req.body.screen_name);
    try {
        if (await getUser(req.body.screen_name)) {
            items = (await getRetweets(req.body.screen_name)).map(tweet => oembed(tweet));
            params['items'] = items;
        }
    } catch (error) {
        console.log(error);
        params['items'] = [error];
    } finally {
        params['rateLimitStatus'] = await rateLimitStatus();
        res.render('index', params);
    };
}