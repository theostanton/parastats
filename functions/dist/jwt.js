"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJwt = generateJwt;
exports.sign = sign;
exports.verifyJwt = verifyJwt;
exports.extractUserFromJwt = extractUserFromJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = require("./model/database/users");
const model_1 = require("./model/model");
function generateJwt(userId) {
    console.log(`generateJwt process.env.SESSION_SECRET=${process.env.SESSION_SECRET}`);
    return jsonwebtoken_1.default.sign({ sub: userId, typ: 'session' }, process.env.SESSION_SECRET, { expiresIn: '2h', algorithm: 'HS256' });
}
function sign(userId, res) {
    console.log(`sign process.env.SESSION_SECRET=${process.env.SESSION_SECRET}`);
    const jwtToken = generateJwt(userId);
    res.cookie('sid', jwtToken, {
        domain: "parastats.info",
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
    });
    return jwtToken;
}
async function verifyJwt(req, res) {
    try {
        console.log(`verifyJwt`);
        const payload = jsonwebtoken_1.default.verify(req.cookies.sid, process.env.SESSION_SECRET);
        const userId = payload.sub;
        console.log(`verifyJwt userId ${userId}`);
        const result = await users_1.users.get(userId);
        console.log('result', result);
        if (result.success) {
            return (0, model_1.success)(result.value);
        }
        res.status(401).end();
    }
    catch {
        res.status(401).end();
    }
    return (0, model_1.failed)("401");
}
async function extractUserFromJwt(req) {
    const payload = jsonwebtoken_1.default.verify(req.cookies.sid, process.env.SESSION_SECRET);
    const userId = payload.sub;
    const result = await users_1.users.get(userId);
    if (result.success) {
        return result.value;
    }
    throw "Tried to extractUserFromJwt on unverified jwt";
}
