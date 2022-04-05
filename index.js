const { createClient } = require('redis');
const dotenv = require('dotenv');
// const { SQSClient, ReceiveMessageCommand } = require("@aws-sdk/client-sqs");

dotenv.config();

// a client can be shared by different commands.
// const client = new SQSClient({
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//     },
//     region: 'us-east-1'
// })
// const SQS_URL = process.env.AWS_SQS_URL || '';

// client.send(new ReceiveMessageCommand({
//     QueueUrl: SQS_URL,
//     WaitTimeSeconds: 20
// })).then(data => {
//     console.log('SQS DATA RECEIVED', data);
// }).catch(err => {
//     console.log('SQS RECEIVE ERROR', err);
// })


const REDIS_URL = process.env.REDIS_URL || '';
const QUEUE_CHANNEL = process.env.QUEUE_CHANNEL || '';

// RedisService Class
class RedisService {
    constructor() {
        this.setupRedis();
    }

    async setupRedis() {
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
        console.log(message);
    }
}

// Create RedisService object
const redisService = new RedisService();

// Start reading from stdin so we don't exit.
process.stdin.resume();