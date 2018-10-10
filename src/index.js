const config = require('dotenv')
const get = require('./utils/get')
const cache = require("redis").createClient(process.env.REDIS_URL)
const TotalVoice = require('totalvoice-node')

const nickname = process.argv[2]
const phoneNumber = process.argv[3]

const Caller = (nickname, phoneNumber) => {
    const totalVoiceClient = new TotalVoice(process.env.TOTAL_VOICE_KEY)

    const CACHE_KEY = 'fortnite-loses-count'

    const getNumberOfLosses = ({ statistics }) => (statistics[7].value - statistics[8].value)

    let randomizeAudio = function () {
        let audios = [
            'https://www.myinstants.com/media/sounds/cetemdemenciaringtone.mp3',
            'https://www.myinstants.com/media/sounds/naofazmal.mp3',
            'https://www.myinstants.com/media/sounds/vai-ganhar-vai-perder-perdeu-ganhoooou.mp3',
            'https://www.myinstants.com/media/sounds/moises-nao-consegue-programa-do-silvio-santos.mp3'
        ]

        return audios[Math.floor(Math.random() * audios.length)]
    }

    let call = function (audio) {
        console.log(`Sent audio: ${audio}.`)

        totalVoiceClient.audio.enviar(process.env.TARGET_TELEPHONE, audio)
            .then(function (data) {
                console.log('Call has been scheduled.')
            })
            .catch(function (error) {
                console.log('Failed to schedule call.')
            })
    }

    let notify = function () {
        console.log('Target has been notified!')

        call(randomizeAudio())
    }

    let notifyTarget = function (totalLooses) {
        console.log('Trying to notify user.')
        console.log(`Current lost matches: ${totalLooses}.`)

        cache.get(CACHE_KEY, function (err, reply) {
            if (reply < totalLooses) {
                notify()
            }
        })

        cache.set(CACHE_KEY, totalLooses)
    }

    let processRequestResponse = function (err, res, body) {
        console.log('Request user data.')

        let response = JSON.parse(body)
        let totalLosses = getNumberOfLosses(response)

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