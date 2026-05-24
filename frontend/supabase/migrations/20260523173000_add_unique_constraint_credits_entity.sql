do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'credits_entity_id_entity_type_key'
      and connamespace = 'lms'::regnamespace
  ) then
    alter table lms.credits
      add constraint credits_entity_id_entity_type_key
      unique (entity_id, entity_type);
  end if;
end $$;
