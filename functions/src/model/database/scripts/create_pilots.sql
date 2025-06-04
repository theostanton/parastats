create table pilots
(
    first_name           text,
    strava_access_token  text,
    strava_refresh_token text,
    strava_expires_at    timestamptz,
    pilot_id             integer not null
        constraint users_pk
            primary key
);;;