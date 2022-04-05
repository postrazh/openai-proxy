const axios = require('axios');

const engine_id = process.env.OPENAI_ENGINE_ID || '';
const url = `https://api.openai.com/v1/engines/${engine_id}/completions`;
const open_api_key = process.env.OPEN_API_KEY || '';

// OpenAI Service Class
class OAIService {
    constructor() {
    }

    async sendRequest() {
        try {
            const data = {
                "prompt": "Hello!",
                "max_tokens": 20
            };
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${open_api_key}`
                }
            };

            const res = await axios.post(url, data, config);
            console.log(res.data);
        } catch (err) {
            console.log('OPENAI REQUEST ERROR', err);
        }
    }
}

module.exports = OAIService;