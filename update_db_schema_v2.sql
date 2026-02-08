-- 1. Add New Columns to Profiles Table
alter table public.profiles add column if not exists account_type text default 'individual';
alter table public.profiles add column if not exists billing_address text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists zip text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists phone text;

-- 2. Update Trigger Function to Include New Fields
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    transaction_id, 
    created_at,
    -- Company Fields
    company_name,
    company_gst,
    company_address,
    company_phone,
    company_email,
    -- New Detailed Fields
    account_type,
    billing_address,
    city,
    state,
    zip,
    country,
    phone
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'transaction_id',
    now(),
    -- Company Mappings
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'company_gst',
    new.raw_user_meta_data->>'company_address',
    new.raw_user_meta_data->>'company_phone',
    new.raw_user_meta_data->>'company_email',
    -- New Detailed Mappings
    new.raw_user_meta_data->>'account_type',
    new.raw_user_meta_data->>'billing_address',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'zip',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;
