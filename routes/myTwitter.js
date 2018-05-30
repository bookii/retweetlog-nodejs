const Twitter = require('twitter');
require('dotenv').config();

// application-only authentication
let client;

const RETWEETS_PER_REQUEST = 30;

const login = (req) => {
    if (req.session.passport) {  // if logged in
        client = new Twitter({
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            access_token_key: req.session.passport.user.accessToken,
            access_token_secret: req.session.passport.user.accessTokenSecret
        });
        return true;  // is logged in
    } else {
        client = new Twitter({
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            access_token_key: process.env.ACCESS_TOKEN_KEY,
            access_token_secret: process.env.ACCESS_TOKEN_SECRET
        });
    }
    return false;
}

const oembed = (retweetedStatus) => {
    const lang = retweetedStatus['lang'];
    const text = retweetedStatus['text'];
    const name = retweetedStatus['user']['name'];
    const screenName = retweetedStatus['user']['screen_name'];
    const idStr = retweetedStatus['id_str'];
    const createdAt = retweetedStatus['created_at'];
    const html = `<blockquote class="twitter-tweet" data-lang="ja"><p lang="${lang}" dir="ltr">${text}</p>&mdash; ${name} (@${screenName}) <a href="https://twitter.com/${screenName}/status/${idStr}">${createdAt}</a></blockquote>`
    return html;
};

const rateLimitStatus = () => {
    return new Promise(resolve => {
        const params = {resources: 'statuses'};
        client.get('application/rate_limit_status', params, (error, object, response) => {
            if (!error) {
                console.log(object['rate_limit_context']);
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
                resolve(tweets)
            } else {
                reject([error['message'] || error[0]['message']]);
            }
        });
    });
};

const getUser = (screenName) => {   // Show if user_timeline is available
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

const getSettings = () => {  // Show profile of the user logging in
    return new Promise((resolve) => {
        client.get('account/settings', {}, (error, profile, response) => {
            if(!error) {
                resolve(profile);
            }
        });
    });
}

const getRetweets = (screenName, maxIdPrev, untilDate, includeSelf) => {
    return new Promise(async (resolve, reject) => {
        let retweets = [];
        let maxId = maxIdPrev;
        if (!maxId) { 
            maxId = BigInt(maxId);
        }
        try {
            while(true) {
                tweets = await getUserTimeline(screenName, maxId);
                if (tweets.length > 1) {
                    let retweetsChunk = [];
                    maxId = BigInt(tweets[tweets.length-1]['id_str']) - 1;
                    if (Date.parse(untilDate)) {
                        tweets = tweets.filter(tweet => Date.parse(tweet['created_at']) < Date.parse(untilDate) + 86400);
                    }
                    retweetsChunk = tweets.map(tweet => tweet['retweeted_status']).filter(tweet => tweet);
                    if (includeSelf == false) {
                        retweetsChunk = retweetsChunk.filter(retweet => retweet['user']['screen_name'] != screenName);
                    }
                    // console.log('retweets.length: ' + retweets.length);
                    Array.prototype.push.apply(retweets, retweetsChunk);
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

const renderWithLoginInfo = async (req, res, ejs) => {
    let isLoggedIn = login(req);
    let loggedInAs = null;
    if (isLoggedIn) {
        const profile = await getSettings();
        loggedInAs = profile['screen_name']
    }
    res.render(ejs, { isLoggedIn: isLoggedIn, loggedInAs: loggedInAs, rateLimitStatus: null });
}

exports.index = (req, res) => {
    renderWithLoginInfo(req, res, 'index');
};

exports.about = (req, res) => {
    renderWithLoginInfo(req, res, 'about');
};

exports.indexWithScreenName = async (req, res) => {
    let params;
    if (!req.body.screenName) {  // empty input
        res.send({items: ['Please enter a TwitterID.'], maxId: null});
    }
    try {
        if (await getUser(req.body.screenName)) {
            params = await getRetweets(req.body.screenName, req.body.maxId, req.body.untilDate, req.body.includeSelf);
            params['items'] = params['items'].map(tweet => oembed(tweet));
        }
    } catch (error) {
        params = error;
    } finally {
        res.send(params);
    };
}