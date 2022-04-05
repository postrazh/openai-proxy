const dotenv = require('dotenv');

dotenv.config();

const Server = require('./src/server');
const server = new Server();
server.run();

// Start reading from stdin so we don't exit.
process.stdin.resume();