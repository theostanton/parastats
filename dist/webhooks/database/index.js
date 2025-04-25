"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContainer = generateContainer;
exports.end = end;
exports.getDatabase = getDatabase;
const ts_postgres_1 = require("ts-postgres");
const dotenv_1 = require("dotenv");
const postgresql_1 = require("@testcontainers/postgresql");
(0, dotenv_1.config)();
let client;
async function generateContainer() {
    const container = await new postgresql_1.PostgreSqlContainer().start();
    client = await (0, ts_postgres_1.connect)({
        host: container.getHost(),
        database: container.getDatabase(),
        user: container.getUsername(),
        password: container.getPassword(),
        port: container.getPort(),
    });
    await client.query(`create table activities
                        (
                            user_id         integer not null,
                            activity_id     integer not null,
                            wing            text    not null,
                            duration_sec    integer not null,
                            distance_meters integer not null
                        );`);
    await client.query(`create table users
                        (
                            first_name text,
                            token      text,
                            user_id    integer not null
                                constraint users_pk
                                    primary key
                        );`);
    return container;
}
async function end() {
    await client.end();
}
async function getDatabase() {
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
