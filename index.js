const config = require('dotenv').config(),
    request = require('request'),
    cache = require("redis").createClient(process.env.REDIS_URL);

const CACHE_KEY = 'fortnite-loses-count';

if (config.error) {
    throw config.error;
}

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
};

let processRequestResponse = function (err, res, body) {
    console.log('Request user data.');

    let response = JSON.parse(body);
    let totalLosses = getNumberOfLosses(response);

    notifyTarget(totalLosses);
};

const options = {
    url: `https://api.fortnitetracker.com/v1/profile/${process.env.TARGET_PLATFORM}/${process.env.TARGET_USERNAME}`,
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'TRN-Api-Key': process.env.TRN_API_KEY
    }
};

let execute = () => request(options, processRequestResponse);

setInterval(execute, 5000);
