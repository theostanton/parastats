"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCode = handleCode;
const axios_1 = __importDefault(require("axios"));
const initialiseUser_1 = __importDefault(require("./initialiseUser"));
async function handleCode(req, res) {
    console.log("handleCode code=", req.query['code']);
    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID.toString(),
        client_secret: process.env.CLIENT_SECRET.toString(),
        code: req.query['code'].toString(),
        grant_type: "authorization_code"
    }).toString();
    let url = `https://www.strava.com/oauth/token?${params}`;
    const response = await axios_1.default.post(url);
    const body = response.data;
    console.log("handleCode body=");
    console.log(body);
    //https://webhooks.parastats.info/?state=&code=dc9f4bba26200268407d872afe1a0e6dd0cbe650&scope=read,activity:write,activity:read_all,read_all
    const result = await (0, initialiseUser_1.default)(body.access_token);
    res.status(200).send({ status: "OK", action: "handleCode", "result": result });
}
