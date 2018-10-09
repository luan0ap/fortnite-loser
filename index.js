const dotenv = require('dotenv'),
    request = require('request'),
    redis = require("redis");

const CACHE_KEY = 'fortnite-loses-count';

const config = dotenv.config();

if (config.error) {
    throw config.error;
}

const cache = redis.createClient({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT
});

const options = {
    url: `https://api.fortnitetracker.com/v1/profile/${process.env.TARGET_PLATFORM}/${process.env.TARGET_USERNAME}`,
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'TRN-Api-Key': process.env.TRN_API_KEY
    }
};

let getNumberOfLosses = function (response) {
    console.log('Processing total losses.');

    let totalMatches = response.lifeTimeStats[7].value;
    let wins = response.lifeTimeStats[8].value;

    return totalMatches - wins;
};

let notify = function () {
    console.log('Target has been notified!');
};

let notifyTarget = function (totalLooses) {
    console.log('Trying to notify user.');

    cache.get(CACHE_KEY, function (err, reply) {
        if (reply < totalLooses) {
            notify();
        }
    });

    cache.set(CACHE_KEY, totalLooses);
    cache.quit();
};

let processRequestResponse = function (err, res, body) {
    console.log('Request user data.');

    let response = JSON.parse(body);
    let totalLosses = getNumberOfLosses(response);

    notifyTarget(totalLosses);
};

request(options, processRequestResponse);
