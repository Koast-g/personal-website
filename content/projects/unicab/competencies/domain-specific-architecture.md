---
title: "Domain-specific architecture"
kind: "UniCab · CSC-324 · Advanced · Development"
---

## The code

### Private profile table

The date of birth gets its own table. Row-Level Security lets each student read only their own row, and students can't insert, update or delete rows at all, so only `complete_onboarding` can write it.

```sql {linenos=inline,linenostart=52}
-- One row per student, same id as their profile. Separate table (not a column
-- on profiles) because every signed-in student can read all of profiles, and a
-- birthday must stay private; here RLS limits each row to its owner.
create table public.private_profiles (
  id             uuid primary key references public.profiles (id) on delete cascade,
  date_of_birth  date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- Static sanity bounds only; the real "past date and at least 16" check,
  -- which depends on today's date, is enforced in complete_onboarding.
  constraint private_profiles_dob_sane
    check (date_of_birth is null or date_of_birth between date '1900-01-01' and date '2100-01-01')
);

create trigger private_profiles_set_updated_at
  before update on public.private_profiles
  for each row execute function public.set_updated_at();

alter table public.private_profiles enable row level security;

-- Only you can read your own private profile. There is no policy for anyone
-- else, so another student's row is invisible.
create policy "Students can view their own private profile"
  on public.private_profiles for select
  to authenticated
  using (id = (select auth.uid()));

-- No client writes at all: private_profiles is written only by
-- complete_onboarding() (security definer), so the age check can't be skipped.
revoke insert, update, delete on public.private_profiles from anon, authenticated;
```

### Function `complete_onboarding`

It runs with the owner's rights (`security definer`) and an empty `search_path`, takes the student from `auth.uid()`, refuses to run twice, checks every field, and then writes both tables in one transaction.

```sql {linenos=inline,linenostart=111}
create or replace function public.complete_onboarding(
  p_full_name text,
  p_class_year integer,
  p_date_of_birth date,
  p_bio text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_name text := btrim(coalesce(p_full_name, ''));
  v_bio text := nullif(btrim(coalesce(p_bio, '')), '');
begin
  if v_me is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  if exists (select 1 from public.profiles where id = v_me and onboarded) then
    raise exception 'This account has already been set up';
  end if;

  if char_length(v_name) < 1 or char_length(v_name) > 100 then
    raise exception 'Please enter your name (up to 100 characters)';
  end if;

  if p_class_year is null or p_class_year < 2024 or p_class_year > 2035 then
    raise exception 'Class year must be between 2024 and 2035';
  end if;

  if p_date_of_birth is null then
    raise exception 'Please enter your date of birth';
  end if;
  if p_date_of_birth > current_date then
    raise exception 'Date of birth cannot be in the future';
  end if;
  if age(p_date_of_birth) < interval '16 years' then
    raise exception 'You must be at least 16 years old to use UniCab';
  end if;

  if v_bio is not null and char_length(v_bio) > 500 then
    raise exception 'Bio must be 500 characters or fewer';
  end if;

  update public.profiles
    set full_name  = v_name,
        class_year = p_class_year,
        bio        = v_bio,
        onboarded  = true
    where id = v_me;
  if not found then
    raise exception 'Profile not found';  -- should never happen (made at sign-up)
  end if;

  insert into public.private_profiles (id, date_of_birth)
  values (v_me, p_date_of_birth)
  on conflict (id) do update
    set date_of_birth = excluded.date_of_birth,
        updated_at = now();
end;
$$;
```

## How this sample shows domain-specific architecture

For this competency, I chose the onboarding, profile, and avatar management portion of our backend because its architecture incorporates both the nature of our application and the technology we use. UniCab is a ride-sharing platform for Grinnell College students, where people like myself are getting in the car with classmates that we might have never interacted with personally. Because of this, the development of the app was really focused on having a profile that provides enough information to establish trust, comfort, and a sense of safety. At the same time, we need to protect the personal information that’s being put into the app.

One of the first architectural decisions that were made was the idea to separate information that is visible to other students from information that will remain private. The `profiles` table was constructed so that a student’s public profile card (name, photo, bio, and class year) is visible to other signed-in students. However, a student’s date of birth is stored separately in a `private_profiles` table. The date of birth is used to verify minimum age requirements for our app, and we decided that other students don’t necessarily need to know this information. By separating private information into its own table, we can apply different access policies to each set of data.

Furthermore, unlike other applications that have a custom backend server between the front end and the database, our iOS application communicates directly with Supabase’s APIs. A student could bypass the application interface and send requests directly to the API using their authentication token (a signed login pass that the app sends with each request to prove who they are). Therefore, the database itself must enforce permissions and validate changes. We accomplish this through a combination of database permissions, Row-Level Security (RLS) policies, and PostgreSQL functions.

For example, students cannot directly change their `class_year`, `onboarded`, or `avatar_url` fields. Instead, specific database functions provide controlled ways to make these changes. The `complete_onboarding()` function handles the initial setup of a student’s profile. The function checks the submitted information and then saves it to both the public and the private profile. These two operations are handled within a single database transaction, which ensures that the profile setup either completes successfully or fails without saving anything. The function also identifies the student by the user ID from their verified authentication token (`auth.uid()`), rather than relying on an ID sent by the application. We use `SECURITY DEFINER` to allow the function to perform the required database operations even though students do not have direct access to them. Lastly, setting a fixed, empty `search_path` and writing out full table names (such as `public.profiles`) prevents the function from being tricked into using the wrong objects.

A similar approach is also applied to the storage of profile pictures. Supabase Storage manages our avatars through a private storage bucket with its own access policies.
