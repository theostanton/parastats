import {Client, connect} from "ts-postgres";
import {config} from "dotenv";

config()

let client: Client

async function setup(): Promise<Client> {
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