const axios = require('axios');
const OAIRequestStatus = require('./types/oai-request-status');

const engine_id     = process.env.OPENAI_ENGINE_ID || '';
const open_api_key  = process.env.OPEN_API_KEY || '';

const openai_url    = `https://api.openai.com/v1/engines/${engine_id}/completions`;

// OpenAI Service Class
class OAIService {
    _onComplete = null;

    constructor(_onComplete = null) {
        this._onComplete = _onComplete;
    }

    async sendRequest(request) {
        const {id, msg} = request;
        try {
            const data = {
                "prompt": msg,
                "max_tokens": 20
            };
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${open_api_key}`
                }
            };

            const res = await axios.post(openai_url, data, config);
            if (!res || !res.data || !Array.isArray(res.data.choices) || res.data.choices.length === 0) {
                throw 'NO DATA'
            }
            this._onComplete && this._onComplete({
                status: OAIRequestStatus.COMPLETE,
                request,
                content: res.data.choices[0].text
            })
            console.log('OPENAI RESPONSE', msg, res.data.choices[0].text);
        } catch (err) {
            console.log('OPENAI REQUEST ERROR', err);
            this._onComplete && this._onComplete({
                status: OAIRequestStatus.ERROR,
                request,
                err
            })
        }
    }
}

module.exports = OAIService;