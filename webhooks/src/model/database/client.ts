import {Client, connect} from "ts-postgres";

let client: Client


export function setClient(_client: Client) {
    client = _client
}

export async function end() {
    await client.end()
}

export async function getDatabase(): Promise<Client> {
    if (!client) {
        console.log("Connecting client")
        client = await connect({
            host: process.env.DATABASE_HOST,
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,

        })
        console.log("Client connected")
    }
    return client
}