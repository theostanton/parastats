import {Client, connect} from "ts-postgres";
import {config} from "dotenv";
import {PostgreSqlContainer, StartedPostgreSqlContainer} from "@testcontainers/postgresql";
import {users} from "./users";

config()

let client: Client

export async function generateContainer(): Promise<StartedPostgreSqlContainer> {

    const container = await new PostgreSqlContainer().start();
    client = await connect({
        host: container.getHost(),
        database: container.getDatabase(),
        user: container.getUsername(),
        password: container.getPassword(),
        port: container.getPort(),
    })

    await client.query(`create table activities
                        (
                            user_id         integer not null,
                            activity_id     integer not null,
                            wing            text    not null,
                            duration_sec    integer not null,
                            distance_meters integer not null
                        );`)

    await client.query(`create table users
                        (
                            first_name text,
                            token      text,
                            user_id    integer not null
                                constraint users_pk
                                    primary key
                        );`)


    return container
}

export async function end() {
    await client.end()
}

export async function getDatabase(): Promise<Client> {
    if (!client) {
        client = await connect({
            host: process.env.DATABASE_HOST,
            database: process.env.DaTABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
        })
    }
    return client
}