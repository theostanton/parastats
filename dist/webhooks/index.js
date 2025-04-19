"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookHandler = void 0;
const webhookHandler = (req, res) => {
    console.log("Received webhook:", req.body);
    console.log("Received webhook:", JSON.stringify(req.body));
    if (req.query['hub.mode'] == 'subscribe') {
        handleChallenge(req, res);
    }
    else {
        res.status(200).send({ status: "OK" });
    }
};
exports.webhookHandler = webhookHandler;
function handleChallenge(req, res) {
    res.status(200).send({ 'hub.challenge': req.query['hub.challenge'] });
}
