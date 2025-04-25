"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookHandler = webhookHandler;
const index_1 = require("./database/index");
async function webhookHandler(req, res) {
    console.log("Received webhook:", req.body);
    console.log("Received webhook:", JSON.stringify(req.body));
    if (req.query['code']) {
        handleCode(req, res);
    }
    else if (req.query['hub.mode'] == 'subscribe') {
        handleChallenge(req, res);
    }
    else {
        const client = await (0, index_1.getDatabase)();
        const rows = await client.query("SELECT * FROM users");
        const users = [...rows];
        res.status(200).send({ status: "OK", users: users });
    }
}
function handleChallenge(req, res) {
    res.status(200).send({ 'hub.challenge': req.query['hub.challenge'] });
}
function handleCode(req, res) {
    //https://webhooks.parastats.info/?state=&code=dc9f4bba26200268407d872afe1a0e6dd0cbe650&scope=read,activity:write,activity:read_all,read_all
}
