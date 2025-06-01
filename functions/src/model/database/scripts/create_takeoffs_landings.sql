CREATE EXTENSION earthdistance CASCADE;;;

create table takeoffs
(
    slug text             not null primary key,
    name text             not null,
    lat  double precision not null,
    lng  double precision not null,
    alt  int              not null
);;;

insert into takeoffs(slug, name, lat, lng, alt)
values ('chamonix---plan-praz---brevent', 'Planpraz', 45.9047, 6.8831, 1917),
       ('chamonix---plan-de-laiguille', 'Plan de l''Aiguille', 45.9379, 6.849, 2237),
       ('col-de-la-forclaz---montmin', 'Col de la Forclaz', 45.8142, 6.2469, 1257);;;

create table landings
(
    slug text             not null primary key,
    name text             not null,
    lat  double precision not null,
    lng  double precision not null,
    alt  int              not null
);;;

insert into landings(slug, name, lat, lng, alt)
values ('chamonix---le-bois-du-bouchet', 'CHAMONIX - LE BOIS DU BOUCHET', 45.92968, 6.87636, 1042),
       ('chamonix---le-savoy', 'CHAMONIX - LE SAVOY', 45.9278, 6.868, 1049);;;

create function distance(from_lat double precision, from_lng double precision, to_lat double precision,
                         to_lng double precision) returns double precision
    immutable
    strict
    parallel safe
    language sql
return earth_distance(ll_to_earth(from_lat, from_lng), ll_to_earth(to_lat, to_lng))::double precision;;;

-- select concat(t.name, ' to ', l.name) as trajectory, distance(t.lat, t.lng, l.lat, l.lng)
-- from takeoffs as t
--          left outer join landings l on true;;;

-- SELECT name, distance(45.904, 6.883, lat, lng) AS distance
-- FROM takeoffs
-- ORDER BY distance;
--
-- select t.slug                                  as slug,
--        distance(t.lat, t.lng, 45.8142, 6.2469) as distance_meters
-- from takeoffs as t
-- order by distance_meters
-- limit 2;