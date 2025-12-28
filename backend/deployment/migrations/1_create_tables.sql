CREATE TABLE lms.users (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    username   TEXT NOT NULL UNIQUE, -- connect with auth_users using this
    role       TEXT NOT NULL,
    member_id  TEXT
);

CREATE TABLE lms.bookings (
    id          BIGSERIAL PRIMARY KEY,
    library_id  BIGINT NOT NULL,
    start_time  TIMESTAMPTZ NOT NULL,
    end_time    TIMESTAMPTZ NOT NULL,
    status      TEXT NOT NULL,
    CHECK (end_time > start_time)
);

CREATE TABLE lms.admin_library_mapping (
    id          BIGSERIAL PRIMARY KEY,
    library_id  BIGINT NOT NULL,
    member_id   TEXT NOT NULL
);

CREATE TABLE lms.counters (
    id      BIGSERIAL PRIMARY KEY,
    name    TEXT NOT NULL UNIQUE,
    value   BIGINT NOT NULL
);

CREATE TABLE lms.credits (
    id           BIGSERIAL PRIMARY KEY,
    entity_id    TEXT NOT NULL,
    entity_type  TEXT NOT NULL,
    value        DOUBLE PRECISION NOT NULL
);

CREATE TABLE lms.credits_history (
    id           BIGSERIAL PRIMARY KEY,
    entity_id    TEXT NOT NULL,
    entity_type  TEXT NOT NULL,
    value        DOUBLE PRECISION NOT NULL,
    comments     TEXT NOT NULL,
    reason       TEXT NOT NULL
);

CREATE TABLE lms.libraries (
    id         BIGSERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    latitude   DOUBLE PRECISION NOT NULL,
    longitude  DOUBLE PRECISION NOT NULL,
    address    TEXT NOT NULL,
    remarks    TEXT NOT NULL,
    status     TEXT NOT NULL
);
