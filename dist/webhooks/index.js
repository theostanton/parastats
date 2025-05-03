"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookHandler = webhookHandler;
const handleCode_1 = require("./executables/handleCode");
const handleChallenge_1 = require("./executables/handleChallenge");
// noinspection JSUnusedGlobalSymbols
async function webhookHandler(req, res) {
    console.log("Received webhook body=", req.body);
    if (req.query['code']) {
        await (0, handleCode_1.handleCode)(req, res);
    }
    else if (req.query['hub.mode'] == 'subscribe') {
        await (0, handleChallenge_1.handleChallenge)(req, res);
    }
    else {
        res.status(200).send({ status: "OK", hello: "world" });
    }
}
