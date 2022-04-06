# waitroom-openai node proxy server

Node proxy server that handles requests to OpenAI and manages persistence storage for request and responses.

## Run
- Run on local
    ```
    > npm install
    > npm start
    ```
- Run on Docker
    ```
    > docker build . -t <your username>/waitroom-proxy-server
    > docker run -d <your username>/waitroom-proxy-server
    ```

## ENV variables
- REDIS_URL : redis server url for persistent storage and queue messaging
- QUEUE_CHANNEL : redis channel name for queue messaging
- OPENAI_ENGINE_ID : OpenAI engine id
- OPEN_API_KEY : OpenAI Api key

## TODO
1. Use Cypress for integration testing.
2. Migrate openai request throttling from node backend
3. Deploy using Kubernetes