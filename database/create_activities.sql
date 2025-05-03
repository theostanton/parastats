create table activities
(
    user_id         integer not null,
    activity_id     integer not null,
    wing            text    not null,
    duration_sec    integer not null,
    distance_meters integer not null
);