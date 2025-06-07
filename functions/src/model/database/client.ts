import {Client, connect} from "ts-postgres";
import { createPool, Pool } from 'generic-pool';

let client: Client;
let connectionPool: Pool<Client> | null = null;

const dbConfig = {
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    bigints: false
};

export function setClient(_client: Client) {
    client = _client
}

export async function end() {
    if (client) await client.end();
    if (connectionPool) {
        await connectionPool.drain();
        await connectionPool.clear();
    }
}

export async function getDatabase(): Promise<Client> {
    console.log(`getDatabase() HOST=${process.env.DATABASE_HOST} client==null=${client == null}`)
    if (!client || client.closed) {
        client = await connect(dbConfig)
        console.log("Client connected")
    }
    return client
}

export function getPool(): Pool<Client> {
    if (!connectionPool) {
        const factory = {
            create: async (): Promise<Client> => {
                const client = await connect(dbConfig);
                console.log("Pool client created");
                return client;
            },
            destroy: async (client: Client): Promise<void> => {
                await client.end();
                console.log("Pool client destroyed");
            },
            validate: async (client: Client): Promise<boolean> => {
                return !client.closed;
            }
        };

        connectionPool = createPool(factory, {
            max: 10,
            min: 2,
            acquireTimeoutMillis: 10_000,
            idleTimeoutMillis: 30_000,
            evictionRunIntervalMillis: 30_000
        });
        
        console.log("Connection pool created")
    }
    return connectionPool;
}

export async function withPooledClient<T>(
    fn: (client: Client) => Promise<T>
): Promise<T> {
    const pool = getPool();
    const client = await pool.acquire();
    
    try {
        return await fn(client);
    } finally {
        await pool.release(client);
    }
}