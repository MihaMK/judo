# Foundation Architecture

## Project Structure

- `src/app`: Next.js App Router routes, layouts, loading and error boundaries. This layer composes screens and must stay thin.
- `src/features`: Feature-first domain boundaries. Business workflows will live inside their owning feature instead of a global utility layer.
- `src/shared`: Reusable UI, layout and small framework-neutral helpers. This must not become a dumping ground for business logic.
- `src/services`: Infrastructure integrations such as Supabase clients. Services expose setup and adapters, not domain workflow decisions.

## App Shell Strategy

The app shell is role-aware and mobile-first. Desktop gets a sidebar; mobile gets bottom navigation with the highest-frequency actions first.

## Auth / Session Flow

Supabase Auth is the identity foundation. The current implementation resolves a minimal `SessionContext` server-side. Role resolution is a placeholder foundation and must later be connected to application profile data once the business schema is defined.

## Feature Boundaries

Attendance, payments, competitions, communication and athlete history are intentionally not implemented. Their route placeholders exist only to stabilize navigation and ownership.

## Athlete Core Foundation

The athlete foundation introduces isolated domain/read-model structure for athletes, guardians and training groups.

- Athlete list and profile screens consume role-scoped read models.
- Parent visibility is restricted to the configured foundation child set.
- Trainer and management visibility use operational athlete data only.
- Attendance, payments, competitions and progression sections are visible as deferred profile sections, without workflow logic.

The current records are foundation data because the project has not defined the production database schema yet. Supabase business persistence must be added only after the schema is explicitly planned.

## Supabase Athlete Persistence

The persistence foundation now defines only the accepted MVP identity and athlete entities:

- `clubs`
- `user_profiles`
- `training_groups`
- `athletes`
- `guardians`
- `athlete_guardians`
- `trainer_profiles`
- `parent_profiles`

The app read models use Supabase when a real authenticated session resolves to an active `user_profiles` row with a `club_id`. If Supabase is not configured locally, the app keeps using isolated foundation data so the shell remains runnable without pretending that production persistence exists.

No attendance, payment, competition, notification, audit, belt, medical or analytics persistence is present.

## Loading / Error Boundaries

Base `loading`, `error` and `not-found` routes are present. Workflow-specific error handling must be added inside each feature when those workflows are implemented.

## Mobile Layout Strategy

The foundation uses:

- sticky top header
- mobile bottom navigation
- large tap targets
- page shells with narrow content on mobile and wider layouts on desktop

Attendance will later require its own optimized local draft state and should not send network requests per tap.

## Deployment / Staging Strategy

Use separate local, staging and production environments with separate Supabase projects or isolated configuration. Environment variables are documented in `.env.example`; real secrets must never be committed.
