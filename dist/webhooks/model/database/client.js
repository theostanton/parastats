"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setClient = setClient;
exports.end = end;
exports.getDatabase = getDatabase;
const ts_postgres_1 = require("ts-postgres");
let client;
function setClient(_client) {
    client = _client;
}
async function end() {
    await client.end();
}
async function getDatabase() {
    if (!client) {
        console.log("Connecting client");
        client = await (0, ts_postgres_1.connect)({
            host: process.env.DATABASE_HOST,
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
        });
        console.log("Client connected");
    }
    return client;
}
