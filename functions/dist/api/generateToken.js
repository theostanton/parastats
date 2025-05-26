"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
const jwt_1 = require("../jwt");
async function generateToken(req, res) {
    const userId = req.query.user_id;
    console.log(`generateToken userId=${userId}`);
    if (!userId) {
        res.status(400).json({ error: "user_id is required" });
        return;
    }
    const jwtToken = (0, jwt_1.generateJwt)(Number.parseInt(userId));
    res.status(200).json({
        jwtToken: jwtToken
    });
}
