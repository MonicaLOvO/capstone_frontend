# Seed data for backend roles & permissions

Send the files in this folder to the backend developer so they can implement the seed (Part 1 of the Roles & Permissions plan).

## What to send

1. **`roles-and-permissions-seed.json`** – Use this for the seed. It has three sections:
   - **`permissions`** – Unique list of permissions. Insert into `permissions` table first (no duplicates).
   - **`roles`** – The three roles. Insert into `roles` table.
   - **`rolePermissions`** – Pairs of `RoleId` and `PermissionId`. Insert into `role_permissions` table after roles and permissions exist.

2. **`roles-and-permissions-api-response.json`** (optional) – Raw response from `GET /api/role/list` for reference. Same data, nested format.

## Seed order (for backend)

1. Insert **permissions** (all items in `permissions` array). Skip or ignore if a permission with that Id already exists (idempotent).
2. Insert **roles** (all items in `roles` array). Skip if role with that Id or RoleName already exists.
3. Insert **rolePermissions** (all pairs in `rolePermissions` array). Skip if the pair already exists.

Using the **same IDs** (GUIDs) as in these files keeps the frontend and any existing references in sync. If the backend generates new IDs, the frontend will still work as long as role **names** (Staff, Manager, SuperAdmin) stay the same.

## What each role can do (plain English)

This is what the JSON does in human terms. The IDs in the file link these together.

---

**Role: Staff** (RoleId `4f40956b-6d11-44aa-a104-6982b52caf16`)

- **Inventory:** can READ and VIEW (no create/edit/delete).
- **Orders:** can VIEW, READ, and UPDATE (no create/delete).

So Staff can see and update inventory and orders only.

---

**Role: Manager** (RoleId `82f154dd-4be1-4b44-a599-fe1851e713b3`)

- **Inventory:** full access (VIEW, READ, CREATE, UPDATE, DELETE).
- **Orders:** full access (VIEW, READ, CREATE, UPDATE, DELETE).
- **Users (People page):** full access (VIEW, READ, CREATE, UPDATE, DELETE).
- **Roles:** VIEW only (can see roles, cannot create/edit/delete them).

So Manager can manage inventory, orders, and people; can only view roles.

---

**Role: SuperAdmin** (RoleId `fc2d636c-5c17-42ed-acbd-86af96620d2a`)

- **Inventory:** full access.
- **Orders:** full access.
- **Users (People page):** full access.
- **Roles:** full access (VIEW, READ, CREATE, UPDATE, DELETE).
- **Tasks:** full access (VIEW, READ, CREATE, UPDATE, DELETE).

So SuperAdmin can do everything in the app (admin).

---

In the JSON, `rolePermissions` is the list of (RoleId, PermissionId) pairs that make the above true. The `permissions` array defines each permission (with its Id, Module, and Action); the `roles` array defines each role (with its Id and RoleName).

---

## Frontend mapping (for reference)

- `Staff` → shown as "Staff"
- `Manager` → shown as "Manager"  
- `SuperAdmin` → shown as "Admin"
