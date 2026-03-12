# Auth, Token & Permissions Verification Guide

Use this checklist to confirm token, session, and role-based permissions work as intended.

---

## 1. Token & session (central hub)

- **Login flow**
  - On successful login, the app:
    1. Saves the JWT in **localStorage** under `wms_token` (used by API calls and `AuthProvider`).
    2. Sets the **cookie** `session-token` (used by **middleware** to allow access to protected routes).
  - Both are set in `src/app/login/page.tsx` (`setAuthCookie(token)` + `login(token)`).

- **Logout / 401**
  - On logout or when the API returns 401, `clearSession()` in `src/auth/session.ts` clears:
    - localStorage token (`clearToken()`)
    - Cookie (`clearAuthCookie()`)
  - So the “central hub” for “am I logged in?” is: **cookie for middleware**, **localStorage + React context for UI and API**.

- **How to verify**
  1. Log in → open DevTools → Application → Local Storage: `wms_token` should be set.
  2. Application → Cookies: `session-token` should be present.
  3. Log out (or trigger 401): both `wms_token` and `session-token` should be gone.
  4. With no cookie, visiting `/people` or `/dashboard` should redirect to `/login` (middleware in `src/middleware.ts`).

---

## 2. Auth context (AuthProvider)

- **Role and user**
  - `AuthProvider` decodes the JWT and exposes `user` (id, name, role) and `role` via `useAuth()`.
  - Role is derived from the token’s `roleName` (or similar); `superadmin` is mapped to `admin`.

- **How to verify**
  1. Log in and check the sidebar: bottom section should show the **real username** and **role** from the token (e.g. Admin, Manager, Staff).
  2. Refresh the page: user and role should stay correct (token read from localStorage on load).

---

## 3. Role–permission rules (frontend)

- **Staff**
  - Can: Dashboard, Inventory, Orders, My Tasks (and related actions allowed by their permissions).
  - Cannot: People Management, Departments, Activity Monitor, Reports, AI Insights (no `people.view` or `departments.view`).

- **Manager**
  - Can: Everything staff can, plus People Management (view/add/edit/delete **staff** only), Activity Monitor, Reports, AI Insights.
  - Cannot: Departments (no `departments.view`), or manage **managers/admins** (only `staff.*` permissions).

- **Admin**
  - Can: Everything, including People Management (all users: staff + managers + admins) and **Departments** (view/add/edit/disable/delete).

- **Sidebar**
  - Nav items are filtered by permission in `Sidebar.tsx`: `visibleItems = navItems.filter((item) => has(item.permission))`.
  - Staff should **not** see “People Management” or “Departments” in the sidebar.

- **URL protection**
  - **People** (`/people`): if the user does not have `people.view`, they are redirected to `/dashboard`.
  - **Departments** (`/departments`): if the user does not have `departments.view`, they are redirected to `/dashboard`.
  - So even if a staff user opens `/people` or `/departments` directly, they are sent away.

---

## 4. Quick test matrix

| Role   | People in sidebar | Departments in sidebar | Open /people      | Open /departments   |
|--------|-------------------|------------------------|-------------------|---------------------|
| Staff  | No                | No                     | Redirect → /dashboard | Redirect → /dashboard |
| Manager| Yes               | No                     | Page loads        | Redirect → /dashboard |
| Admin  | Yes               | Yes                    | Page loads        | Page loads          |

---

## 5. Where it’s implemented

- **Permissions:** `src/config/permissions.ts`, `src/types/permissions.ts`
- **Nav items & required permission:** `src/config/navigation.tsx`
- **Sidebar filtering:** `src/components/layout/Sidebar.tsx`
- **People page guard:** `src/app/(dashboard)/people/page.tsx` (redirect if `!has("people.view")`)
- **Departments page guard:** `src/app/(dashboard)/departments/page.tsx` (redirect if `!has("departments.view")`)
- **Token/session:** `src/auth/` (AuthProvider, session, token), `src/lib/authCookies.ts`
- **Middleware (cookie check):** `src/middleware.ts`
- **AuthGuard:** `src/components/AuthGuard.tsx` — wraps dashboard layout; redirects to `/login` if not authenticated, shows "Loading..." while resolving auth.

---

## 6. Hardcoding check (Sidebar, People, Departments)

- **Sidebar:** Uses `userRole` from Auth (JWT). Nav items and permission keys from `config/navigation.tsx` and `config/permissions.ts`. No role IDs or API data hardcoded. Only logic: “show Departments link when `userRole === 'admin'`”.
- **People page:** Role list and IDs from `GET /api/role/list` → `roleIdMap`, `availableRoles`. Role filter options and Add/Edit role dropdown both use `availableRoles`. Departments in filters and drawer from `GET /api/department/list`. Table data from `GET /api/user/list`. No role or department IDs hardcoded.
- **Departments page:** Department list from `GET /api/department/list`. Access control: `role === 'admin'` from Auth. No department IDs or lists hardcoded.
- **By design:** Frontend role names (`admin` | `manager` | `staff`) and permission keys (e.g. `people.view`) are fixed in config; that is the app’s permission model, not backend data.

---

## 7. Steps to check overall functionality

1. **Login & token**
   - Log in with a valid user. In DevTools → Application → Local Storage, confirm `wms_token` exists. In Cookies, confirm `session-token` exists.
   - Refresh the page: you should stay logged in and see the same user/role in the sidebar.

2. **Logout & 401**
   - Log out: both token and cookie should be cleared. Visit `/dashboard` or `/people`: you should be redirected to `/login`.
   - (Optional) If the API returns 401, the app should clear session and redirect to login.

3. **Sidebar by role**
   - **Staff:** Sidebar shows Dashboard, Inventory, Orders, Reports. No “People Management”, no “Departments”.
   - **Manager:** Same as Staff, plus “People Management”. No “Departments”.
   - **Admin:** Same as Manager, plus “Departments”.
   - Bottom of sidebar shows the logged-in user’s name and role (e.g. Admin, Manager, Staff).

4. **URL protection**
   - As **Staff**, open `/people` or `/departments` directly: you should be redirected to `/dashboard` (or login if not authenticated).
   - As **Manager**, open `/departments`: redirect to dashboard. Open `/people`: page loads.
   - As **Admin**, both `/people` and `/departments` load.

5. **People page**
   - **Filters:** Role and Department dropdowns show options from the API (same as Add/Edit). Change filters and confirm the table updates (and/or API is called with the right params).
   - **Search:** Type a name, part of email, or “SuperAdmin”; results should update (search tries FirstName, LastName, then Email).
   - **Add Person:** Open “+ Add Person”. Role dropdown shows only Admin, Manager, Staff (from API). Department dropdown shows departments from API. Create a user and confirm they appear in the table with the chosen role/department.
   - **Edit/Delete/Disable:** As **Admin** (not SuperAdmin), you must not see Edit/Delete/Disable on other Admin users. As **SuperAdmin**, you can act on everyone. As **Manager**, you can act only on Staff. Confirm row actions match this.

6. **Departments page (Admin only)**
   - As Admin, open Departments. Table lists departments from API. Add Department: enter name and optional description, save; new department appears. Edit/disable/delete if the UI supports it; confirm list updates.

7. **Other pages**
   - Dashboard, Inventory, Orders, Reports: load without errors for roles that have the corresponding sidebar links. No need to test every feature; confirm navigation and that the app doesn’t break.
