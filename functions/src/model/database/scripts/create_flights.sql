create type description_status as enum ('todo', 'done', 'failed');;;

create table flights
(
    strava_activity_id text                     not null
        constraint activities_pk
            primary key,
    pilot_id           integer                  not null,
    wing               text                     not null,
    duration_sec       integer                  not null,
    distance_meters    integer                  not null,
    start_date         timestamp with time zone not null,
    description        text                     not null,
    polyline           json,
    landing_id         text,
    takeoff_id         text
);