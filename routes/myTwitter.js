const Twitter = require('twitter');
require('dotenv').config();

// application-only authen8tication
let client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const RETWEETS_PER_REQUEST = 30;

const login = (req) => {
    if (req.session.passport) {  // if logged in
        client = new Twitter({
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            access_token_key: req.session.passport.user.accessToken,
            access_token_secret: req.session.passport.user.accessTokenSecret
        });
        console.log('LOGGED IN');
        return true;  // is logged in
    }
    return false;
}

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
        if (maxId != null) {

            params['max_id'] = maxId;
        }
        client.get('statuses/user_timeline', params, (error, tweets, response) => {
            if(!error) {
                resolve(tweets);
            } else {
                // console.log(error);
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
                reject({items: [error[0]['message']], maxId: null});
            }
        });
    });
};

const getSettings = () => {
    return new Promise((resolve) => {
        client.get('account/settings', {}, (error, profile, response) => {
            if(!error) {
                resolve(profile);
            }
        });
    });
}

const getRetweets = (screenName, maxIdPrev) => {
    return new Promise(async (resolve, reject) => {
        let retweets = [];
        let maxId = maxIdPrev;
        try {
            while(true) {
                tweets = await getUserTimeline(screenName, maxId);
                if (tweets.length > 1) {
                    maxId = tweets[tweets.length-1]['id'] - 1;
                    Array.prototype.push.apply(retweets, tweets.map(tweet => tweet['retweeted_status']).filter(tweet => tweet));
                    console.log('retweets.length: ' + retweets.length);
                    if (retweets.length > RETWEETS_PER_REQUEST) {
                        break;
                    } 
                } else {
                    break;
                }
            } 
        } catch (error) {
            reject({items: error, maxId: maxId});
        }
        resolve({items: retweets, maxId: maxId});
    });
};

exports.index = async (req, res) => {
    let isLoggedIn = login(req);
    let loggedInAs = null;
    if (isLoggedIn) {
        const profile = await getSettings();
        loggedInAs = profile['screen_name']
    }
    res.render('index', { isLoggedIn: isLoggedIn, loggedInAs: loggedInAs, rateLimitStatus: await rateLimitStatus() });
};

exports.indexWithScreenName = async (req, res) => {
    let params;
    if (!req.body.screenName) {  // empty input
        res.send({items: ['Please enter a TwitterID.'], maxId: null});
    }
    console.log(req.session);
    try {
        if (await getUser(req.body.screenName)) {
            params = await getRetweets(req.body.screenName, req.body.maxIdPrev);
            params['items'] = params['items'].map(tweet => oembed(tweet));
        }
    } catch (error) {
        params = error;
    } finally {
        res.send(params);
    };
}