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
