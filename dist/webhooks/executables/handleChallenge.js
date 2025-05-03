"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChallenge = handleChallenge;
async function handleChallenge(req, res) {
    res.status(200).send({ 'hub.challenge': req.query['hub.challenge'] });
}
