"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const client_1 = require("./client");
const model_1 = require("../model");
var users;
(function (users) {
    async function insert(user) {
        const database = await (0, client_1.getDatabase)();
        await database.query("INSERT into users (first_name, token, user_id) values ($1, $2, $3)", [user.first_name, user.token, user.user_id]);
    }
    users.insert = insert;
    async function get(userId) {
        const database = await (0, client_1.getDatabase)();
        const result = await database.query("select first_name, token, user_id from users where user_id = $1", [userId]);
        if (result.rows.length === 1) {
            return new model_1.Success(result.rows[0].reify());
        }
        else {
            return new model_1.Failed(`No results for userId=${userId}`);
        }
    }
    users.get = get;
    async function getToken(userId) {
        const database = await (0, client_1.getDatabase)();
        const result = await database.query("select token from users where user_id = $1", [userId]);
        if (result.rows.length === 1) {
            return new model_1.Success(result.rows[0].reify().token);
        }
        else {
            return new model_1.Failed(`No results for userId=${userId}`);
        }
    }
    users.getToken = getToken;
})(users || (exports.users = users = {}));
