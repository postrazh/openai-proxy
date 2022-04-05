const OAIService = require("./oai-service");
const RedisService = require("./redis-service");

class Server {
    constructor() {
    }

    run() {
        // Init Redis Service
        this.redisService = new RedisService(this.onMessage.bind(this));
        this.redisService.setup();

        // Init OpenAI Service
        this.oaiService = new OAIService();
    }

    onMessage(message) {
        this.oaiService.sendRequest();
    }
}

module.exports = Server;