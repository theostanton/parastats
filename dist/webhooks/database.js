"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_postgres_1 = require("ts-postgres");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
let client;
async function setup() {
    if (!client) {
        client = await (0, ts_postgres_1.connect)({
            host: process.env.DATABASE_HOST,
            database: process.env.DaTABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
        });
    }
    return client;
}
