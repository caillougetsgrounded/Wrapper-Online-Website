const loadPost = require('../request/post_body');
const mp3Duration = require('mp3-duration');
const voices = require('./info').voices;
const asset = require('../asset/main');
const get = require('../request/get');
const qs = require('querystring');
const brotli = require('brotli');
const https = require('https');
const http = require('http');

function processVoice(voicename, text) {
    return new Promise((res, rej) => {
        const voice = voices[voicename];
        switch (voice.source) {
            case 'voiceforge': {
                const domain = 'https://api.';
                const path = 'wrapper.online/tts';
                const cleanUrl = domain + path;
                const query = '?voice=' + voice.arg;
                const fullText = '&text=' + encodeURIComponent(text);
                get(cleanUrl + query + fullText)
                    .then(res)
                    .catch(rej);
                break;
            }
            case 'polly': {
                var q = qs.encode({
                    texttype: "text",
                    text: text,
                    fallbackLanguage: "0",
                    voice: voice.arg,
                    rate: "0",
                    whisper: "false",
                    soft: "false",
                    wordbreakms: "0",
                    volume: "0",
                    marksid: "ca6108ea-0a",
                    d: "true",
                    format: "mp3",
                });
                https.get({
                    host: 'talkify.net',
                    path: '/api/aitts?' + q,
                    headers: { 'user-agent': 'Mozilla/5.0' }
                }, (r) => {
                    var buffer = [];
                    r.on('data', (d) => buffer.push(d));
                    r.on('end', () => res(Buffer.concat(buffer)));
                });
                break;
            }
            default: {
                rej(new Error('Unsupported voice source'));
                break;
            }
        }
    });
}

module.exports = processVoice;
