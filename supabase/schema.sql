-- profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  email text,
  stripe_customer_id text,
  payment_status text default 'unpaid',   -- 'unpaid' | 'paid'
  subscription_status text,               -- 'active' | 'past_due' | 'cancelled'
  questionnaire_completed_at timestamptz,
  email_1_sent_at timestamptz,
  email_2_sent_at timestamptz,
  email_3_sent_at timestamptz,
  created_at timestamptz default now()
);

-- questionnaire_answers table
create table if not exists questionnaire_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  goal text,          -- from Q1, used for protocol routing
  answers jsonb,      -- full answers object
  created_at timestamptz default now()
);

-- RLS: profiles - users can only read/update their own row
alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- RLS: questionnaire_answers - users can only read/write their own rows
alter table questionnaire_answers enable row level security;

create policy "Users can read own questionnaire_answers"
  on questionnaire_answers for select
  using (auth.uid() = user_id);

create policy "Users can insert own questionnaire_answers"
  on questionnaire_answers for insert
  with check (auth.uid() = user_id);

-- Trigger: create profile on signup (optional - or create from app)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, payment_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    'unpaid'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
