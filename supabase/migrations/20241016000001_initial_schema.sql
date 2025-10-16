-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  username text not null unique,
  full_name text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create business_cards table
create table public.business_cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  profile_id uuid references public.profiles on delete cascade not null,
  name text not null,
  title text,
  company text,
  email text,
  phone text,
  website text,
  address text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index profiles_user_id_idx on public.profiles(user_id);
create index profiles_username_idx on public.profiles(username);
create index business_cards_user_id_idx on public.business_cards(user_id);
create index business_cards_profile_id_idx on public.business_cards(profile_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.business_cards enable row level security;

-- Profiles RLS policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- Business cards RLS policies
create policy "Users can view their own business cards"
  on public.business_cards for select
  using (auth.uid() = user_id);

create policy "Users can insert their own business cards"
  on public.business_cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own business cards"
  on public.business_cards for update
  using (auth.uid() = user_id);

create policy "Users can delete their own business cards"
  on public.business_cards for delete
  using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_business_cards_updated_at
  before update on public.business_cards
  for each row
  execute procedure public.handle_updated_at();

