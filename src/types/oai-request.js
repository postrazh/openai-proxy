class OpenAIRequest {
    id;
    msg;

    constructor(id, msg) {
        this.id     = id;
        this.msg    = msg;
    }
}

module.exports = OpenAIRequest;