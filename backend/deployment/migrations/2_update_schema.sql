ALTER TABLE lms.bookings
ADD COLUMN member_id TEXT NOT NULL,
ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE lms.credits
ADD COLUMN updated_at TIMESTAMPTZ,
ADD COLUMN updated_by TEXT,
ADD COLUMN updated_by_type TEXT,
ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
ADD COLUMN created_by TEXT,
ADD COLUMN created_by_type TEXT;

ALTER TABLE lms.libraries
ALTER COLUMN remarks TYPE DOUBLE PRECISION
USING remarks::double precision;

ALTER TABLE lms.users
ADD COLUMN email TEXT,
ADD COLUMN phone_number TEXT,
ADD COLUMN updated_at TIMESTAMPTZ,
ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX idx_bookings_library_id ON lms.bookings(library_id);
CREATE INDEX idx_admin_library_mapping_member_id ON lms.admin_library_mapping(member_id);
CREATE INDEX idx_credits_entity ON lms.credits(entity_id, entity_type);
CREATE INDEX idx_users_member_id ON lms.users (member_id);
CREATE INDEX idx_users_email ON lms.users (email);
CREATE INDEX idx_users_phone_number ON lms.users (phone_number);

ALTER TABLE lms.users
ADD CONSTRAINT users_id_not_empty
CHECK (length(trim(id)) > 0);

ALTER TABLE lms.bookings
ADD COLUMN purpose TEXT;