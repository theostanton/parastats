"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const handleCode_1 = require("./handleCode");
const handleChallenge_1 = require("./handleChallenge");
async function handler(req, res) {
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
