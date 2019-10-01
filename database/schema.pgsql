CREATE TABLE IF NOT EXISTS users (
    id          SERIAL      PRIMARY KEY,
    uuid        UUID        NOT NULL UNIQUE,
    username    TEXT        NOT NULL UNIQUE,
    email       TEXT        NOT NULL UNIQUE,
    password    TEXT        NOT NULL
);
