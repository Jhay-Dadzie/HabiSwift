-- HabitEX authentication, user profiles, and landlord verification storage.
-- Initial remote Supabase migration.
--
-- Passwords and login email addresses deliberately live only in Supabase Auth
-- (auth.users). Never store password hashes in a public application table.

create type public.landowner_verification_status as enum (
    'draft',
    'pending',
    'verified',
    'rejected'
);

-- Application data that is safe to expose through the Supabase Data API.
-- Every profile is inherently a tenant. A related landowners row tracks the
-- optional upgrade process; only a verified row should receive landlord-only
-- privileges elsewhere in the schema.
-- The primary key is the matching Supabase Auth user ID.
create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text not null,
    phone_number text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint profiles_full_name_length
        check (char_length(btrim(full_name)) between 2 and 150),
    constraint profiles_phone_number_length
        check (
            phone_number is null
            or char_length(btrim(phone_number)) between 7 and 20
    )
);

-- A user can have at most one landowner application and remains a tenant after
-- becoming a verified landowner. The document columns contain object paths
-- inside the private "landowner-verification" Storage bucket.
-- Files should use this layout:
--   <user-id>/ghana-card/front/<filename>
--   <user-id>/ghana-card/back/<filename>
--   <user-id>/selfie/<filename>
--   <user-id>/ownership/<filename>
create table public.landowners (
    user_id uuid primary key references public.profiles (id) on delete cascade,
    ghana_card_front_path text,
    ghana_card_back_path text,
    selfie_path text,
    proof_of_ownership_path text,
    verification_status public.landowner_verification_status not null default 'draft',
    rejection_reason text,
    submitted_at timestamptz,
    reviewed_at timestamptz,
    reviewed_by uuid references auth.users (id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint landowners_ghana_card_front_owned_path
        check (
            ghana_card_front_path is null
            or ghana_card_front_path like user_id::text || '/ghana-card/front/%'
        ),
    constraint landowners_ghana_card_back_owned_path
        check (
            ghana_card_back_path is null
            or ghana_card_back_path like user_id::text || '/ghana-card/back/%'
        ),
    constraint landowners_selfie_owned_path
        check (
            selfie_path is null
            or selfie_path like user_id::text || '/selfie/%'
        ),
    constraint landowners_proof_owned_path
        check (
            proof_of_ownership_path is null
            or proof_of_ownership_path like user_id::text || '/ownership/%'
        ),
    constraint landowners_rejection_reason_matches_status
        check (
            verification_status = 'rejected'
            or rejection_reason is null
        ),
    constraint landowners_review_fields_match_status
        check (
            verification_status in ('verified', 'rejected')
            or (reviewed_at is null and reviewed_by is null)
        )
);

create index landowners_verification_status_idx
    on public.landowners (verification_status);

-- Maintain updated_at without trusting client-supplied timestamps.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger landowners_set_updated_at
before update on public.landowners
for each row execute function public.set_updated_at();

-- Document changes move a complete application to pending review. A verified
-- landlord cannot replace their identity documents through the client.
create function public.prepare_landowner_document_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if old.verification_status = 'verified' then
        raise exception 'Verified landlord documents cannot be changed';
    end if;

    new.reviewed_at := null;
    new.reviewed_by := null;
    new.rejection_reason := null;

    if new.ghana_card_front_path is not null
       and new.ghana_card_back_path is not null
       and new.selfie_path is not null
       and new.proof_of_ownership_path is not null then
        new.verification_status := 'pending';
        new.submitted_at := now();
    else
        new.verification_status := 'draft';
        new.submitted_at := null;
    end if;

    return new;
end;
$$;

create trigger landowners_prepare_document_update
before update of
    ghana_card_front_path,
    ghana_card_back_path,
    selfie_path,
    proof_of_ownership_path
on public.landowners
for each row execute function public.prepare_landowner_document_update();

-- Create the public profile automatically after Supabase Auth creates a user.
-- Sign-up metadata may contain full_name, phone_number, and role. A role value
-- of "landowner" or "landlord" creates the optional landlord record too.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    wants_landowner boolean;
    requested_name text;
    requested_phone text;
begin
    wants_landowner := lower(coalesce(new.raw_user_meta_data ->> 'role', ''))
        in ('landowner', 'landlord');

    requested_name := coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
        nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
        nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
        'New user'
    );

    if char_length(requested_name) < 2 then
        requested_name := 'New user';
    end if;

    requested_phone := nullif(btrim(coalesce(
        new.phone,
        new.raw_user_meta_data ->> 'phone_number'
    )), '');

    insert into public.profiles (id, full_name, phone_number)
    values (new.id, left(requested_name, 150), requested_phone);

    if wants_landowner then
        insert into public.landowners (user_id) values (new.id);
    end if;

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- The trigger functions should only be invoked by their triggers.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.prepare_landowner_document_update() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Lock down Data API access. Users may read their own rows, update only their
-- editable profile fields, and attach only their own document paths.
alter table public.profiles enable row level security;
alter table public.landowners enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.landowners from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name, phone_number) on table public.profiles to authenticated;

grant select on table public.landowners to authenticated;
grant insert (user_id) on table public.landowners to authenticated;
grant update (
    ghana_card_front_path,
    ghana_card_back_path,
    selfie_path,
    proof_of_ownership_path
) on table public.landowners to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.landowners to service_role;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Landowners can read their own verification"
on public.landowners
for select
to authenticated
using ((select auth.uid()) = user_id);

-- A tenant can start the extra landowner verification steps by creating this
-- optional record. Creating it does not mean the user is verified yet.
create policy "Users can start their own landowner application"
on public.landowners
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Landowners can update their own verification documents"
on public.landowners
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- One private bucket is sufficient because every verification artifact has the
-- same audience and retention rules. Store only its object paths in landowners.
insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'landowner-verification',
    'landowner-verification',
    false,
    10485760,
    array[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
        'application/pdf'
    ]::text[]
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Direct client uploads must be placed below the signed-in user's UUID folder.
-- Bucket administrators should use a server-only service-role client.
create policy "Landowners can read their own verification files"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'landowner-verification'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
        select 1
        from public.landowners
        where user_id = (select auth.uid())
    )
);

create policy "Landowners can upload their own verification files"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'landowner-verification'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
        select 1
        from public.landowners
        where user_id = (select auth.uid())
    )
);

create policy "Landowners can replace their own verification files"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'landowner-verification'
    and owner_id = (select auth.uid())::text
)
with check (
    bucket_id = 'landowner-verification'
    and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Landowners can delete their own verification files"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'landowner-verification'
    and owner_id = (select auth.uid())::text
);

