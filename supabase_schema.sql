-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users not null primary key,
  last_period_start_date date,
  typical_cycle_length_days int default 28,
  typical_period_length_days int default 5,
  pms_window_length_days int default 5,
  irregular_cycles_mode boolean default false,
  
  -- Module Toggles
  show_module_exercise boolean default true,
  show_module_food boolean default true,
  show_module_mood boolean default true,
  show_module_suggestions boolean default true,
  show_module_favorites boolean default true,
  
  -- Notifications
  notify_period_soon boolean default true,
  notify_ovulation_window boolean default true,
  notify_pms_window boolean default true,
  
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. PERIODS TABLE
create table public.periods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  start_date date not null,
  end_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Periods
alter table public.periods enable row level security;

create policy "Users can view own periods" on public.periods
  for select using (auth.uid() = user_id);

create policy "Users can insert own periods" on public.periods
  for insert with check (auth.uid() = user_id);

create policy "Users can update own periods" on public.periods
  for update using (auth.uid() = user_id);

create policy "Users can delete own periods" on public.periods
  for delete using (auth.uid() = user_id);

-- 3. DAY LOGS TABLE
create table public.day_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  log_date date not null,
  
  flow text check (flow in ('None', 'Light', 'Medium', 'Heavy')),
  mood_tags text[],
  symptom_tags text[],
  notes text,
  energy_level int,
  sleep_hours numeric,
  
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Ensure one log per day per user
  unique(user_id, log_date)
);

-- RLS for Day Logs
alter table public.day_logs enable row level security;

create policy "Users can view own logs" on public.day_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert own logs" on public.day_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own logs" on public.day_logs
  for update using (auth.uid() = user_id);

create policy "Users can delete own logs" on public.day_logs
  for delete using (auth.uid() = user_id);

-- 4. FAVORITES TABLE
create table public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  phase text not null,
  item_type text not null, -- 'exercise', 'focus_food', 'supplement', 'hydration'
  label text not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Prevent duplicates
  unique(user_id, phase, item_type, label)
);

-- RLS for Favorites
alter table public.favorites enable row level security;

create policy "Users can view own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- Helper to handle new user creation (Optional but recommended)
-- Automatically creates a profile entry when a new user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
