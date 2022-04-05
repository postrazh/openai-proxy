const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || '';
const QUEUE_CHANNEL = process.env.QUEUE_CHANNEL || '';

// RedisService Class
class RedisService {
    _onMessage;

    constructor(_onMessage = null) {
        this._onMessage = _onMessage;
    }

    async setup() {
        try {
            this.client = createClient({
                // url: 'redis://alice:foobared@awesome.redis.server:6380'
                url: REDIS_URL
            });
            this.client.on('error', (err) => console.log('Redis Client Error', err));

            console.log("Redis Client connecting ...");

            await this.client.connect();
            console.log("Redis Client connected!");

            this.subscriber = this.client.duplicate();
            await this.subscriber.connect()
            console.log("Redis Subscriber connected!");

            await this.subscriber.subscribe(QUEUE_CHANNEL, this.onMessage.bind(this));
            console.log("Redis subscribed to", QUEUE_CHANNEL);
        } catch (err) {
            console.log("Redis Client connection failed", err);
        }
    }

    async onMessage(message) {
        this._onMessage && this._onMessage(message);
    }
}

module.exports = RedisService;