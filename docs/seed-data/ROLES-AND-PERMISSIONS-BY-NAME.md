# Roles and their permissions (for seed – by name, no IDs)

Use this for seeding: **role name** and **permission** (Module + Action). Backend can resolve names to IDs when inserting.

---

## 1. SuperAdmin vs Admin (industry standard for WMS)

- **SuperAdmin** – For **developers only**. Full system access; use for testing and support. Do not assign to business users.
- **Admin** – For **business administrators**. Same or nearly same permissions as SuperAdmin (e.g. all modules) but separate role so you can:
  - Give only Admin to real users and keep SuperAdmin for devs.
  - Later restrict SuperAdmin to extra “system” permissions if needed.

So: **Yes, it makes sense to have both.** Create an **Admin** role with all (or same) permissions as SuperAdmin, and keep **SuperAdmin** for developers only. Frontend can treat both as “admin” in the UI (e.g. show Departments, full People access) by mapping both role names to the same UI role.

---

## 2. Role names and their permissions

Permission format: **Module** + **Action** (e.g. `INVENTORY.READ`, `ORDER.CREATE`).

---

### Role: **Staff**  
**Description:** Basic staff access.

**Permissions:**
- INVENTORY.READ  
- INVENTORY.VIEW  
- ORDER.VIEW  
- ORDER.READ  
- ORDER.UPDATE  

---

### Role: **Manager**  
**Description:** Can view and edit inventory, orders, and manage staff (People).

**Permissions:**
- INVENTORY.READ  
- INVENTORY.VIEW  
- INVENTORY.CREATE  
- INVENTORY.UPDATE  
- INVENTORY.DELETE  
- ORDER.VIEW  
- ORDER.READ  
- ORDER.CREATE  
- ORDER.UPDATE  
- ORDER.DELETE  
- USER.VIEW  
- USER.READ  
- USER.CREATE  
- USER.UPDATE  
- USER.DELETE  
- ROLE.VIEW  

---

### Role: **SuperAdmin**  
**Description:** Developers only – full access to all modules.

**Permissions:** (all 25)
- INVENTORY.READ  
- INVENTORY.VIEW  
- INVENTORY.CREATE  
- INVENTORY.UPDATE  
- INVENTORY.DELETE  
- ORDER.VIEW  
- ORDER.READ  
- ORDER.CREATE  
- ORDER.UPDATE  
- ORDER.DELETE  
- USER.VIEW  
- USER.READ  
- USER.CREATE  
- USER.UPDATE  
- USER.DELETE  
- ROLE.VIEW  
- ROLE.READ  
- ROLE.CREATE  
- ROLE.UPDATE  
- ROLE.DELETE  


---

### Role: **Admin** (when you add it)  
**Description:** Business administrator – same access as SuperAdmin for app use, not for devs.

**Permissions:** Same list as SuperAdmin above (all 25), or whatever set you use for “full access” in the app. Frontend will map `Admin` and `SuperAdmin` to the same UI “admin” so both see the same pages and actions.

---

## 3. Full list of permissions (by Module)

Use this to create permission records if needed. Format: **Module**, **Action**, **Description**.

| Module   | Action | Description                    |
|----------|--------|--------------------------------|
| INVENTORY| READ   | READ access for INVENTORY      |
| INVENTORY| VIEW   | VIEW access for INVENTORY      |
| INVENTORY| CREATE | CREATE access for INVENTORY    |
| INVENTORY| UPDATE | UPDATE access for INVENTORY    |
| INVENTORY| DELETE | DELETE access for INVENTORY    |
| ORDER    | VIEW   | VIEW access for ORDER          |
| ORDER    | READ   | READ access for ORDER          |
| ORDER    | CREATE | CREATE access for ORDER        |
| ORDER    | UPDATE | UPDATE access for ORDER        |
| ORDER    | DELETE | DELETE access for ORDER       |
| USER     | VIEW   | VIEW access for USER           |
| USER     | READ   | READ access for USER           |
| USER     | CREATE | CREATE access for USER         |
| USER     | UPDATE | UPDATE access for USER         |
| USER     | DELETE | DELETE access for USER        |
| ROLE     | VIEW   | VIEW access for ROLE           |
| ROLE     | READ   | READ access for ROLE           |
| ROLE     | CREATE | CREATE access for ROLE         |
| ROLE     | UPDATE | UPDATE access for ROLE         |
| ROLE     | DELETE | DELETE access for ROLE        |
| TASK     | VIEW   | VIEW access for TASK           |
| TASK     | READ   | READ access for TASK           |
| TASK     | CREATE | CREATE access for TASK        |
| TASK     | UPDATE | UPDATE access for TASK         |
| TASK     | DELETE | DELETE access for TASK        |

---

You can implement the seed by: (1) ensuring these permissions exist (by Module + Action), (2) creating roles by name, (3) linking each role to the listed permissions by name (or by ID after lookup). No object IDs required in this document.
