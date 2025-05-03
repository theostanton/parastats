create table users
(
    first_name text,
    token      text,
    user_id    integer not null
        constraint users_pk
            primary key
);