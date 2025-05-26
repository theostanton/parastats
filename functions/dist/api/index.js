"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.default = handler;
const express_1 = __importDefault(require("express"));
const jwt_1 = require("../jwt");
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const getSelf_1 = require("./getSelf");
const getActivities_1 = require("./getActivities");
const getActivity_1 = require("./getActivity");
const generateToken_1 = require("./generateToken");
async function handler(req, res) {
    console.log("Received api body=", JSON.stringify(req.body));
    const verifyResult = await (0, jwt_1.verifyJwt)(req, res);
    if (!verifyResult.success) {
        console.log("Verification failed: ", JSON.stringify(verifyResult.error));
        return;
    }
    const user = verifyResult.value;
    // const database = await getDatabase();
    // const result = await database.query<UserRow>("SELECT * FROM users")
    // const users = [...result];
    res.status(200).send({ "status": "OK", "hello": user.first_name });
}
const jsonParser = body_parser_1.default.json({});
const app = (0, express_1.default)();
exports.app = app;
app.use('/token/', generateToken_1.generateToken);
app.use((0, cookie_parser_1.default)());
app.use(async (req, res, next) => {
    console.log(`verifying req.cookies.sid=${req.cookies.sid}`);
    const userResult = await (0, jwt_1.verifyJwt)(req, res);
    if (userResult.success) {
        console.log(`Verified user=${JSON.stringify(userResult.value)}`);
        next();
    }
    else {
        console.log(`Auth failed error=${userResult.error}`);
    }
});
app.use(jsonParser);
app.use('/activities', getActivities_1.getActivities);
app.use('/activities/:id', getActivity_1.getActivity);
app.use(getSelf_1.getSelf);
