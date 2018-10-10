const config = require('dotenv')
const cache = require("redis").createClient(process.env.REDIS_URL)
const TotalVoice = require('totalvoice-node')

const get = require('./utils/get')
const randomize = require('./utils/randomize')
const audios = require('./audios')

const nickname = process.argv[2]
const phoneNumber = process.argv[3]

const Caller = (nickname, phoneNumber) => {
    const totalVoiceClient = new TotalVoice(process.env.TOTAL_VOICE_KEY)

    const CACHE_KEY = 'fortnite-loses-count'

    const getNumberOfLosses = ({ statistics }) => (statistics[7].value - statistics[8].value)

    const call = function (audio) {

        totalVoiceClient.audio.enviar(phoneNumber, audio)
            .then(function (data) {
                console.log('Call has been scheduled.')
            })
            .catch(function (error) {
                console.log('Failed to schedule call.')
            })
    }

    const notify = function () {
        call(randomize(audios))
    }

    const notifyTarget = function (totalLooses) {
        cache.get(CACHE_KEY, function (err, reply) {
            if (reply < totalLooses) {
                notify()
            }
        })
        cache.set(CACHE_KEY, totalLooses)
    }

    const processRequestResponse = function (err, res, body) {
        console.log('Request user data.')

        const response = JSON.parse(body)
        const totalLosses = getNumberOfLosses(response)

        notifyTarget(totalLosses)
    }

    const requesUserData = {
        url: `https://api.fortnitetracker.com/v1/profile/${process.env.TARGET_PLATFORM}/${process.env.TARGET_USERNAME}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'TRN-Api-Key': process.env.TRN_API_KEY
        }
    }
}

Caller(nickname, phoneNumber)