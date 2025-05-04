create type description_status as enum ('todo', 'done', 'failed');

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