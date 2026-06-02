# Supabase Connection And RLS Validation Runbook

This document is the real-environment validation guide before any attendance implementation starts.

Do not bypass RLS, disable policies, use service role for normal app reads, or create shortcut visibility logic.

## 1. Supabase Setup Steps

Work only from the Judo project root:

```bash
cd C:/Users/jAS/OneDrive/Documents/Judo
```

Create or select one Supabase project for this standalone Judo application.

Required Supabase dashboard setup:

1. Confirm email/password auth is enabled.
2. Copy the project URL.
3. Copy the anon public key.
4. Copy the service role key for server-only bootstrap use.
5. Do not reuse credentials from any other project.

The service role key is used only for controlled bootstrap logic. Normal app reads must use the authenticated Supabase session and RLS.

## 2. `.env.local` Requirements

Create `.env.local` from `.env.example`.

Required values:

```bash
NEXT_PUBLIC_SUPABASE_URL=<judo-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<judo-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<judo-supabase-service-role-key>
JUDO_BOOTSTRAP_ALLOWED_EMAILS=owner@example.com
JUDO_BOOTSTRAP_CLUB_ID=11111111-1111-4111-8111-111111111111
```

Rules:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may be exposed to the browser.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to client code.
- `JUDO_BOOTSTRAP_ALLOWED_EMAILS` must contain only explicit trusted emails.
- `JUDO_BOOTSTRAP_CLUB_ID` must match the seeded club ID unless seed data is changed intentionally.

## 3. Migration Apply Commands

Install or make available the Supabase CLI first. Then apply migrations from the Judo root.

Remote project workflow:

```bash
supabase login
supabase link --project-ref <judo-project-ref>
npm run supabase:push
```

Local Supabase workflow:

```bash
supabase start
npm run supabase:reset
```

Expected result:

- `clubs` exists.
- `user_profiles` exists.
- `training_groups` exists.
- `athletes` exists.
- `guardians` exists.
- `athlete_guardians` exists.
- `trainer_profiles` exists.
- `parent_profiles` exists.
- RLS is enabled on all eight tables.
- No attendance, payment, competition, notification, audit, belt, medical, or analytics tables exist.

## 4. Exact Test Users Needed

Create these Supabase Auth users in the Judo Supabase project:

```text
management@example.com
trainer@example.com
parent-ana@example.com
parent-marko@example.com
unassigned@example.com
```

Use any safe test passwords in the Supabase dashboard. Do not commit passwords.

## 5. Bootstrap Management Profile

Set:

```bash
JUDO_BOOTSTRAP_ALLOWED_EMAILS=management@example.com
```

Validation:

1. Start the app:

```bash
npm run dev
```

2. Open `/login`.
3. Sign in as `management@example.com`.
4. Go to `/bootstrap`.
5. Click `Create management profile`.
6. Expected: redirect to `/today`.
7. Expected database row:
   - `user_profiles.auth_user_id` matches the management auth user.
   - `user_profiles.role = 'management'`.
   - `user_profiles.club_id = '11111111-1111-4111-8111-111111111111'`.

If bootstrap says the email is not allowlisted, fix `JUDO_BOOTSTRAP_ALLOWED_EMAILS` and restart the dev server.

## 6. Create Trainer And Parent Role Mappings

After management bootstrap, create the remaining role mappings deliberately in Supabase SQL editor or table editor.

Trainer mapping:

- Create `user_profiles` for `trainer@example.com`.
- `role = 'trainer'`.
- `club_id = 11111111-1111-4111-8111-111111111111`.
- Create one `trainer_profiles` row linked to that `user_profiles.id`.

Parent Ana mapping:

- Create `user_profiles` for `parent-ana@example.com`.
- `role = 'parent'`.
- `club_id = 11111111-1111-4111-8111-111111111111`.
- Create one `parent_profiles` row linked to guardian `Mila Stojanovska`.

Parent Marko mapping:

- Create `user_profiles` for `parent-marko@example.com`.
- `role = 'parent'`.
- `club_id = 11111111-1111-4111-8111-111111111111`.
- Create one `parent_profiles` row linked to guardian `Elena Petrova`.

Unassigned user:

- Do not create any `user_profiles` row for `unassigned@example.com`.

Parent scope must always flow through:

```text
parent_profiles -> guardians -> athlete_guardians -> athletes
```

Do not add shortcut athlete IDs to `user_profiles`.

## 7. Protected Route Validation

Unauthenticated browser session:

- `/login`: shows login form.
- `/today`: redirects/renders login.
- `/athletes`: redirects/renders login.
- `/management`: redirects/renders login.

Authenticated but unassigned user:

- Login as `unassigned@example.com`.
- `/today`: redirects to `/unassigned`.
- `/athletes`: redirects to `/unassigned`.
- `/management`: redirects to `/unassigned`.
- `/bootstrap`: allowed only if email is allowlisted; otherwise bootstrap action is rejected.

Authenticated assigned users:

- Login restores session after browser refresh.
- Header shows display name and role.
- Logout returns user to `/login`.
- Protected routes are no longer visible after logout.

## 8. Role Visibility Validation

Management user:

- `/today`: visible.
- `/athletes`: visible.
- `/management`: visible.
- Athlete list contains Ana, Marko, and Luka from seed data.
- Athlete profile pages are accessible for all seeded athletes.

Trainer user:

- `/today`: visible.
- `/athletes`: visible.
- `/attendance`: visible as placeholder only.
- `/payments`: not shown in trainer primary navigation.
- `/management`: not shown in trainer primary navigation.
- Athlete list contains operational club athletes.

Parent Ana user:

- `/today`: visible.
- `/athletes`: not shown in parent primary navigation.
- Direct `/athletes` access should not expose unrelated children.
- Parent-visible athlete read model should include Ana only.
- Marko and Luka profile URLs must not reveal their data.

Parent Marko user:

- Parent-visible athlete read model should include Marko only.
- Ana and Luka profile URLs must not reveal their data.

## 9. RLS Validation Workflow

Use `supabase/tests/rls_validation.sql` as the checklist.

Validate with real authenticated sessions, not service role.

Expected RLS outcomes:

- Anonymous user reads zero rows.
- Unassigned authenticated user reads zero athlete rows.
- Management reads all club athletes.
- Trainer reads club athletes.
- Parent Ana reads only Ana through guardian relationship.
- Parent Marko reads only Marko through guardian relationship.
- Parent user cannot read unrelated guardian records.
- Parent user cannot read unrelated `athlete_guardians` links.

Important: if a parent can see all athletes, stop before attendance. That means role scoping or RLS is unsafe.

## 10. App Shell Validation

For each assigned role:

- Correct role appears in the header.
- Navigation matches role.
- Logout button works.
- Refresh keeps the session.
- Closing and reopening browser restores session if Supabase session is still valid.

Expected navigation:

Management:

- Today
- Athletes
- Attendance
- Payments
- Competitions
- Notifications
- Management

Trainer:

- Today
- Athletes
- Attendance
- Competitions
- Notifications

Parent:

- Today
- Payments
- Competitions
- Notifications

## 11. Local Development Validation Flow

Clean local validation sequence:

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

Then validate:

1. `/login` renders.
2. Unauthenticated `/today` does not expose app data.
3. Management bootstrap works.
4. Management can see all athletes.
5. Trainer can see operational athletes.
6. Parent can see only linked child data.
7. Logout blocks protected routes again.

## 12. Known Risks / Issues

- Migrations have not been applied until `npm run supabase:push` or `npm run supabase:reset` succeeds.
- RLS cannot be fully validated without real Supabase Auth users.
- Bootstrap requires the service role key, but normal app read paths must not use service role.
- Parent route navigation currently hides `/athletes`, but direct URL access still depends on read-model and RLS scoping. Validate direct profile URLs before attendance.
- If `.env.local` is missing, the app can run in foundation fallback mode, but that does not validate real Supabase persistence.

## 13. Must Validate Before Attendance Phase

Do not start attendance until all are true:

- Migrations applied successfully.
- Seeded club/groups/athletes/guardians exist.
- Management bootstrap works.
- Trainer profile mapping works.
- Parent profile mapping works.
- Parent scope is proven through `parent_profiles -> guardians -> athlete_guardians -> athletes`.
- Unassigned authenticated user is blocked.
- Anonymous user is blocked.
- RLS parent isolation is verified.
- App shell role navigation is verified.
- Logout/login/session restore is verified.

Attendance depends on stable persisted:

- athlete IDs
- group IDs
- trainer role mapping
- parent role mapping
- RLS visibility rules
