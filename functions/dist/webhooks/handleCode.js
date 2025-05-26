"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCode = handleCode;
const axios_1 = __importDefault(require("axios"));
const stravaApi_1 = require("../model/stravaApi");
const client_1 = require("../model/database/client");
const trigger_1 = __importDefault(require("../tasks/trigger"));
const jwt_1 = require("../jwt");
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
    const token = body.access_token;
    const api = new stravaApi_1.StravaApi(token);
    const database = await (0, client_1.getDatabase)();
    // Fetch profile
    const athlete = await api.fetchAthlete();
    // Save profile to `user` table
    const result = await database.query(`
                INSERT INTO users (user_id, first_name, token)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id)
                    DO UPDATE SET first_name = $4,
                                  token      = $5;`, [athlete.id, athlete.firstname, token, athlete.firstname, token]);
    console.log(`Inserted user ${result.rows[0]}`);
    await (0, trigger_1.default)({ name: "FetchAllActivities", userId: athlete.id });
    (0, jwt_1.sign)(athlete.id, res);
    res.redirect('https://parastats.info');
    // res.status(200).send({status: "OK", action: "handleCode"});
}
