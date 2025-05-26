"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelf = getSelf;
const jwt_1 = require("../jwt");
async function getSelf(req, res) {
    const user = await (0, jwt_1.extractUserFromJwt)(req);
    res.status(200).json({ user });
}
