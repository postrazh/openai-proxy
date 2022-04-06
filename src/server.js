const OAIService = require("./oai-service");
const RedisService = require("./redis-service");
const OpenAIRequest = require("./types/oai-request");

class Server {
    constructor() {
    }

    run() {
        // Init Redis Service
        this.redisService = new RedisService(this.onMessage.bind(this));
        this.redisService.setup();

        // Init OpenAI Service
        this.oaiService = new OAIService(this.onOAIComplete.bind(this));
    }

    onMessage(data) {
        try {
            const {id, msg} = data;
            const request = new OpenAIRequest(id, msg)

            this.oaiService.sendRequest(request);
        } catch (err) {
            console.log('ERROR Parsing Request', err);
        }
    }

    onOAIComplete(data) {
        this.redisService.handleOAIResponse(data);
    }
}

module.exports = Server;