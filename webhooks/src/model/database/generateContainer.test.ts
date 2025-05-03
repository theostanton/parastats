import {PostgreSqlContainer, StartedPostgreSqlContainer} from "@testcontainers/postgresql";
import {connect} from "ts-postgres";
import {setClient} from "./client";
import {ActivityRow, UserRow} from "./model";
import {insertActivities} from "./activities";
import {users} from "./users";
import insert = users.insert;

export async function generateContainer(users: UserRow[] = [], activities: ActivityRow[] = []): Promise<StartedPostgreSqlContainer> {

    const container = await new PostgreSqlContainer().start();
    const client = await connect({
        host: container.getHost(),
        database: container.getDatabase(),
        user: container.getUsername(),
        password: container.getPassword(),
        port: container.getPort(),
    })

    await client.query(`create type description_status as enum ('todo', 'done', 'failed');`)

    await client.query(`
        create table activities
        (
            user_id            bigint                                                not null,
            activity_id        bigint                                                not null
                constraint activities_pk
                    primary key,
            wing               text                                                  not null,
            duration_sec       integer                                               not null,
            distance_meters    integer                                               not null,
            start_date         timestamp with time zone                              not null,
            description_status description_status default 'todo'::description_status not null,
            description        text                                                  not null
        );
    `)

    await client.query(`
        create table users
        (
            first_name text,
            token      text,
            user_id    integer not null
                constraint users_pk
                    primary key
        );
    `)

    setClient(client)

    for (const user of users) {
        await insert(user);
    }
    const result = await insertActivities(activities)

    return container
}