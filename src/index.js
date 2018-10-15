const config = require('dotenv').config()
const cache = require('redis').createClient(process.env.REDIS_URL)
const TotalVoice = require('totalvoice-node')

const request = require('./utils/request')
const randomize = require('./utils/randomize')
const audios = require('./audios')

const nickname = process.argv[2]
const phoneNumber = process.argv[3]

const Caller = (nickname = '', phoneNumber = 0) => {
    const totalVoiceClient = new TotalVoice(process.env.TOTAL_VOICE_KEY)

    const getNumberOfLosses = ({ lifeTimeStats }) => (lifeTimeStats[7].value - lifeTimeStats[8].value)

    const call = audio => totalVoiceClient.audio.enviar(phoneNumber, audio)
        .then(() => console.log('Call has been scheduled.'))
        .catch(() => console.log('Failed to schedule call.'))

    const notify = () => setTimeout((audio) => {
        call(audio)
        notify()
    }, 3000, randomize(audios))

    const notifyTarget = (totalLooses) => {
        cache.get(process.env.CACHE_KEY, function (err, reply) {
            if (reply >= totalLooses) {
                notify()
            }
        })
        cache.set(process.env.CACHE_KEY, totalLooses)
    }

    const processRequestResponse = data => notifyTarget(getNumberOfLosses(data))

    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'TRN-Api-Key': process.env.TRN_API_KEY
        }
    }

    request(`https://api.fortnitetracker.com/v1/profile/${process.env.TARGET_PLATFORM}/${nickname}`, options)
        .then(processRequestResponse)
}

Caller(nickname, phoneNumber)