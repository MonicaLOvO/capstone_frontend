# Roles & Permissions: Seed vs Role Section — Plan

## The problem

- New teammates (or new environments) have an **empty** `roles` and `role_permissions` DB → users see **null** roles.
- You can’t expect everyone to use Postman to create roles and link permissions.

## Recommendation: Do both (in order)

| Approach | Purpose | Effort | When |
|----------|--------|--------|------|
| **1. Seed (backend)** | Every DB gets default roles + role-permissions on first run. Fixes “null” for all team members and deployments. | Low (backend only) | **First** — quick win |
| **2. Role section (frontend + backend)** | Admins manage roles and permissions from the app (like Departments). Professional and flexible. | Medium (new page + APIs) | **Second** — when you have time |

If you **must pick one**:

- **Seed only** → Fastest. Everyone gets Staff, Manager, SuperAdmin and correct permissions. No way for admins to add new roles from the UI.
- **Role section only** → New DBs still start empty unless you also add a seed or manual step. Better long-term UX, but more work and doesn’t fix “new DB = null” by itself.

So: **seed first**, then add the Role section so you have both “works everywhere” and “admins can manage roles.”

---

## Can we do Part 2 only (skip the seed)?

**Yes.** You can implement the Role section directly and use it as the way to create and manage roles.

**Why she can log in but sees different roles:** She almost certainly has **SuperAdmin** in her DB (that’s why she can log in as admin). Her DB just doesn’t have the same other roles (e.g. Staff, Manager) or role–permission links that you set up on your side. So she sees “null” or fewer options for roles elsewhere in the app.

- **Access:** Only **Admin** (SuperAdmin in the backend) can access the Roles page and perform any actions. Same pattern as Departments:
  - **Frontend:** Redirect non-admin to `/dashboard`; show the "Roles" nav item only when `userRole === "admin"`.
  - **Backend (recommended):** Enforce that only SuperAdmin (or the role that maps to "admin") can call role create/update/delete and role-permission APIs; return 403 for others.
- **Safe:** Restricting the page and APIs to admin only keeps it safe. No other roles (Manager, Staff) can see or change roles.
- **Quick:** Reuse the Departments page pattern (table, add/edit modal, row actions). The only extra piece is the "Edit permissions" flow (list permissions, multi-select, then `PUT /api/role-permission`).

**Caveat:** If someone has a **completely empty** DB (zero roles), they have no way to log in as admin until at least one role (e.g. SuperAdmin) and one admin user exist. So for a brand-new environment, someone still has to create the first role once (e.g. via Postman, seed, or a one-time script). After that, admins can do everything from the Role section.

---

## Seed vs Role section: who does what?

| Option | Where it’s done | Can the frontend team do it? |
|--------|------------------|------------------------------|
| **Seed** (Part 1) | Backend repo only. Code runs on the server (migration or startup) and inserts rows into `roles`, `permissions`, `role_permissions`. | **No.** The frontend cannot write to the database. Only someone with access to the backend repo (and DB) can add and run the seed. |
| **Role section** (Part 2) | Frontend: new page + API calls. Backend: role/permission APIs (create role, list permissions, replace role-permissions) — often already exist (e.g. you used them in Postman). | **Yes.** You build the Roles page and call the existing backend APIs. No backend code change needed if the APIs are already there. |

**If you only work in the frontend repo:** The only option you can own end-to-end is **Part 2 (Role section)**. Once it’s built, any admin (e.g. your teammate with SuperAdmin) can log in and create the missing roles (Staff, Manager) and assign permissions from the UI — same result as you doing it in Postman, but from the app. That’s how the “whole thing works” without needing a seed or backend changes from your side.

---

## Part 1: Seed (backend) — quick & professional

**Goal:** When the backend (or DB) is set up, default roles and role–permission links are created automatically. No Postman, no manual steps.

**Where:** Backend repo (e.g. .NET): migration or startup seed.

**Seed data for backend:** See **`docs/seed-data/`** in this repo. It contains:
- **`roles-and-permissions-seed.json`** – permissions (unique list), roles, and rolePermissions pairs. Use this for the seed; insert in order: permissions → roles → role_permissions.
- **`README.md`** – short instructions for the backend developer (what each section is, seed order, idempotency).
Send the whole `docs/seed-data/` folder (or at least the JSON + README) to the backend teammate.

**Steps:**

1. **Define seed data (match your current DB):**
   - **Roles:** e.g. `Staff`, `Manager`, `SuperAdmin` (with same names you use in the app).
   - **Permissions:** list of permission records (if your backend has a `permissions` table).
   - **Role–permissions:** which permission IDs map to which role IDs (e.g. what you did in Postman with `PUT /api/role-permission`).

2. **Run seed when DB is empty (or on first deploy):**
   - Option A: **Migration** that inserts into `roles`, `permissions`, and `role_permissions` if they don’t exist (e.g. check row count, then insert).
   - Option B: **Startup seed** in the backend that runs once (e.g. on first run or when a “seed” flag is set) and inserts the same data.

3. **Idempotency:** Design so running the seed multiple times doesn’t duplicate roles (e.g. “insert only if role name doesn’t exist” or “use fixed GUIDs for default roles”).

**Result:** Any new clone, new teammate, or new environment that runs migrations/seed gets the same roles and role-permissions. Your frontend already uses `GET /api/role/list` — no frontend changes needed.

---

## Part 2: Role section (frontend) — like Departments

**Goal:** Admin-only page to list roles, add/edit/delete roles, and assign permissions to a role (same idea as Departments, but for roles and with a permission picker).

**Where:** Frontend (this repo) + backend (ensure APIs exist).

### Backend (verify or add)

From your Postman setup you likely have:

- `GET /api/role/list` — already used by frontend.
- `POST /api/role` — create role (e.g. body: `{ "RoleName", "Description" }`).
- `PUT /api/role/{id}` — update role.
- `DELETE /api/role/{id}` — delete role (only if no users assigned, or handle in backend).
- `PUT /api/role-permission` — replace all permissions for a role (body: `{ "RoleId", "PermissionIds": [] }`).

You also need a way to list permissions (for the “assign permissions” UI):

- `GET /api/permission/list` (or similar) returning e.g. `{ Id, Name, Description? }[]`.

If any of these are missing, add them in the backend first.

### Frontend (this repo)

1. **API layer**
   - **Roles:** extend `src/services/api/roles/roles.api.ts` with `create`, `update`, `remove` (and `getById` if needed). Match the backend payloads (e.g. `RoleName`, `Description`).
   - **Role–permissions:** add e.g. `replacePermissions(roleId: string, permissionIds: string[])` calling `PUT /api/role-permission`.
   - **Permissions:** add `src/services/api/permissions/permissions.api.ts` with `list()` calling `GET /api/permission/list`, plus a small type for permission (Id, Name, etc.).

2. **Role Management page**
   - New route: e.g. `/roles` (or `/settings/roles`).
   - Restrict to admin only (same pattern as Departments: check `role === "admin"`, redirect otherwise).
   - **List:** table of roles (columns e.g. Role Name, Description, # Permissions, Actions).
   - **Add/Edit role:** modal/drawer with form (RoleName, Description), similar to `DepartmentDialog`. On save, call `rolesApi.create` or `rolesApi.update`.
   - **Assign permissions:** per role, a button “Edit permissions” that opens a second modal/drawer with a list of permissions (from `permissionsApi.list()`) as checkboxes or multi-select; on save, call `replacePermissions(roleId, selectedIds)`.

3. **Navigation**
   - Add a “Roles” (or “Role management”) item in the sidebar for admin only, e.g. under Management, next to Departments. Use a permission like `people.view` or a dedicated one (e.g. `roles.manage`) if your backend supports it.

4. **People page**
   - No change needed: it already loads roles via `rolesApi.list()` and builds the dropdown from that. New roles created in the Role section will show up there.

### UX details

- Reuse patterns from **Departments**: same layout (header + “Add role” button), same table + row actions (Edit, Delete), same modal form style.
- For “Edit permissions”, show permission names (and optionally descriptions) so admins can understand what they’re assigning.
- Optional: prevent deleting a role that is still assigned to users (backend can return a clear error; frontend can show it in the delete confirmation).

---

## Summary

| Step | Action | Owner | Outcome |
|------|--------|--------|---------|
| 1 | Add **seed** in backend for default roles + role_permissions | Backend | Every new DB has correct roles; teammates and deployments see same data. |
| 2 | Expose **permission list** API if missing | Backend | Frontend can show permission checkboxes in Role section. |
| 3 | Implement **Role section** (list, create, update, delete, assign permissions) | Frontend | Admins can manage roles and permissions from the app. |

**Quick win:** Part 1 (seed) only — unblocks everyone with minimal work.  
**Professional and complete:** Part 1 + Part 2 — consistent data everywhere plus in-app role management.
