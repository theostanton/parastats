import {Client, connect} from "ts-postgres";

let client: Client

export async function getDatabase(): Promise<Client> {
    console.log(`getDatabase() null||closed=${client?.closed} `)

    if (!client || client.closed) {
        console.log(`getDatabase() DATABASE_HOST=${process.env.DATABASE_HOST}`)
        client = await connect({
            host: process.env.DATABASE_HOST,
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            keepAlive: false,
        })
        console.log("Client connected")
    }
    return client
}