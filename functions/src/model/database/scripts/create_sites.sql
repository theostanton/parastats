CREATE EXTENSION earthdistance CASCADE;;;

create table windsocks
(
    balise_id text             not null primary key,
    name      text             not null,
    lat       double precision not null,
    lng       double precision not null,
    alt       integer          not null
);;;

create type site_type as enum ('Takeoff','Landing');;;

create table sites
(
    ffvl_sid          text             not null primary key,
    slug              text unique      not null,
    name              text             not null,
    lat               double precision not null,
    lng               double precision not null,
    alt               int              not null,
    nearest_balise_id text,
    polygon           json,
    type              site_type
);;;

insert into sites(ffvl_sid, slug, name, lat, lng, alt)
values (1, 'chamonix---plan-praz---brevent', 'Planpraz', 45.9047, 6.8831, 1917),
       (2, 'chamonix---plan-de-laiguille', 'Plan de l''Aiguille', 45.9379, 6.849, 2237),
       (3, 'col-de-la-forclaz---montmin', 'Col de la Forclaz', 45.8142, 6.2469, 1257),
       (4, 'chamonix---le-bois-du-bouchet', 'CHAMONIX - LE BOIS DU BOUCHET', 45.92968, 6.87636, 1042),
       (5, 'chamonix---le-savoy', 'CHAMONIX - LE SAVOY', 45.9278, 6.868, 1049);;;

create function distance(from_lat double precision, from_lng double precision, to_lat double precision,
                         to_lng double precision) returns double precision
    immutable
    strict
    parallel safe
    language sql
return earth_distance(ll_to_earth(from_lat, from_lng), ll_to_earth(to_lat, to_lng))::double precision;;;