const { createClient } = require('redis');
const OAIRequestStatus = require('./types/oai-request-status');

const REDIS_URL = process.env.REDIS_URL || '';
const QUEUE_CHANNEL = process.env.QUEUE_CHANNEL || '';

const TBL_PREFIX = 'request';
const TBL_FIELD_ID = 'id';
const TBL_FIELD_MSG = 'msg';
const TBL_FIELD_RESPONSE = 'resp';
const TBL_FIELD_STATUS = 'status';
const INDEX_SET_PREFIX = 'msg';

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
        let duplicated;
        let data;

        try {
            data = JSON.parse(message);
            if (!data || !data.id || !data.msg) {
                throw 'INVALID REQUEST DATA';
            }

            const { id, msg } = data;

            const indexSetKey = `${INDEX_SET_PREFIX}:${msg}`;
            const requests = await this.client.sMembers(indexSetKey);
            if (Array.isArray(requests) && requests.length > 0) {
                duplicated = true;
            }
        } catch (err) {
            console.log('REDIS DUPLICATE CHECK ERROR', err);
        }

        if (!duplicated && this._onMessage) {
            try {
                const { id, msg } = data;

                const key = `${TBL_PREFIX}:${id}`;
                // await this.client.hSet(key, TBL_FIELD_ID, id)
                await this.client.hSet(key, TBL_FIELD_MSG, msg)
                await this.client.hSet(key, TBL_FIELD_STATUS, OAIRequestStatus.QUEUED)

                const indexSetKey = `${INDEX_SET_PREFIX}:${msg}`;
                await this.client.sAdd(indexSetKey, key);

                this._onMessage(data);
            } catch (err) {
                console.log('REDIS PERSISTING ERROR', err);
            }
        }
    }

    async handleOAIResponse(data) {
        try {
            const { status, request: {id, msg}, content, err } = data;

            const key = `${TBL_PREFIX}:${id}`;
            const indexSetKey = `${INDEX_SET_PREFIX}:${msg}`;

            if (status == OAIRequestStatus.COMPLETE) {
                // await this.client.hSet(key, TBL_FIELD_ID, id)
                await this.client.hSet(key, TBL_FIELD_MSG, msg)
                await this.client.hSet(key, TBL_FIELD_RESPONSE, content)
                await this.client.hSet(key, TBL_FIELD_STATUS, status)

                await this.client.sAdd(indexSetKey, key)
            } else {
                await this.client.sPop(indexSetKey)

                await this.client.hDel(key, TBL_FIELD_MSG)
                await this.client.hDel(key, TBL_FIELD_RESPONSE)
                await this.client.hDel(key, TBL_FIELD_STATUS)
            }
        } catch (err) {
            console.log('REDIS PERSISTING ERROR', err);
        }
    }
}

module.exports = RedisService;