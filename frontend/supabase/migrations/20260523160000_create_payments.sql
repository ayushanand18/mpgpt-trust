create table if not exists lms.payments (
  id uuid primary key default gen_random_uuid(),
  student_user_id text not null references lms.users(id),
  student_member_id text not null,
  amount_paid numeric(10, 2) not null,
  utr_number text not null,
  payment_date date not null,
  file_path text not null,
  status text not null default 'auth_pending',
  student_note text,
  review_comment text,
  credits_to_add integer not null,
  reviewed_by text references lms.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_status_check check (status in ('auth_pending', 'approved', 'rejected'))
);

create index if not exists payments_status_idx on lms.payments (status);
create index if not exists payments_student_member_id_idx on lms.payments (student_member_id);
create index if not exists payments_student_user_id_idx on lms.payments (student_user_id);
create index if not exists payments_created_at_idx on lms.payments (created_at desc);
