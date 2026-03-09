"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Box, Typography, Button } from "@mui/joy";
import { useAuth } from "@/auth/AuthProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { PeopleTable, type Person } from "./components/PeopleTable";
import { useState } from "react";
import { PeopleFilters, PeopleFiltersValue } from "./components/PeopleFilters";
import { PersonDrawer } from "./components/PersonDrawer/PersonDrawer";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
} from "@mui/joy";
import { usersApi } from "@/services/api/users/users.api";
import { mapUser } from "@/services/api/users/users.mapper";
import { rolesApi } from "@/services/api/roles/roles.api";
import { departmentsApi } from "@/services/api/departments/departments.api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function PeoplePage() {
  const { role } = useAuth();
  const effectiveRole = role ?? "staff";
  const { has } = usePermissions(effectiveRole);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [departments, setDepartments] = useState<
    { id: string; name: string; isActive: boolean }[]
  >([]);

  /** Role IDs from API – only roles that exist in DB (avoids FK errors) */
  const [roleIdMap, setRoleIdMap] = useState<
    Partial<Record<Person["role"], string>>
  >({});
  /** Role options for Add/Edit Person dropdown (only roles that exist in DB) */
  const [availableRoles, setAvailableRoles] = useState<
    { role: Person["role"]; label: string }[]
  >([]);

  
  /** Only admin and manager can view People page; staff redirect to dashboard */
  useEffect(() => {
    if (role !== undefined && !has("people.view")) {
      router.replace("/dashboard");
    }
  }, [role, has, router]);
  
  const [loading, setLoading] = useState(true);
  /**
   * TEMP MOCK DATA
   * Later replaced by:
   * usersApi.list()
  */
 const [people, setPeople] = useState<Person[]>([
   // {
    //   id: "1",
    //   firstName: "John",
    //   lastName: "Admin",
    //   email: "admin@wms.com",
    //   role: "admin",
    //   status: "active",
    //   createdAt: "2026-02-01",
    // },
    // {
      //   id: "2",
      //   firstName: "Sarah",
      //   lastName: "Manager",
      //   email: "manager@wms.com",
      //   role: "manager",
      //   status: "active",
      //   createdAt: "2026-02-02",
      // },
      // {
        //   id: "3",
    //   firstName: "Mike",
    //   lastName: "Staff",
    //   email: "staff@wms.com",
    //   role: "staff",
    //   status: "active",
    //   createdAt: "2026-02-03",
    // },
  ]);
  
  const [filters, setFilters] = useState<PeopleFiltersValue>({
    search: searchParams.get("search") ?? "",
    roleName: searchParams.get("role") ?? "",
    departmentName: searchParams.get("department") ?? "",
  });
  
  const selectableDepartments = departments.filter((d) => d.isActive);
  
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  
  const debouncedSearch = useDebouncedValue(filters.search, 400);
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.roleName) params.set("role", filters.roleName);
    if (filters.departmentName)
      params.set("department", filters.departmentName);

    if (page > 1) params.set("page", String(page));

    router.replace(`?${params.toString()}`);
  }, [filters, page, router]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.roleName, filters.departmentName]);

  async function loadUsers() {
    try {
      setLoading(true);

      //const searchValue = filters.search?.trim();

      //   const response = await usersApi.list({
      //     Page: page,
      //     PageSize: pageSize,
      //     //Email: filters.search || undefined,
      //     // FirstName: filters.search || undefined,
      //     // LastName: filters.search || undefined,

      //       ...(searchValue
      // ? searchValue.includes("@")
      //   ? { Email: searchValue }
      //   : searchValue.includes(" ")
      //     ? { LastName: searchValue.split(" ").pop() }
      //     : { FirstName: searchValue }
      // : {}),

      //     RoleName: filters.roleName || undefined,
      //     DepartmentName: filters.departmentName || undefined,

      const searchValue = debouncedSearch?.trim();

      let response;

      if (!searchValue) {
        response = await usersApi.list({
          Page: page,
          PageSize: pageSize,
          RoleName: filters.roleName || undefined,
          DepartmentName: filters.departmentName || undefined,
        });
      } else if (searchValue.includes("@")) {
        // EMAIL SEARCH
        response = await usersApi.list({
          Page: page,
          PageSize: pageSize,
          Email: searchValue,
          RoleName: filters.roleName || undefined,
          DepartmentName: filters.departmentName || undefined,
        });
      } else {
        // TRY FIRST NAME
        response = await usersApi.list({
          Page: page,
          PageSize: pageSize,
          FirstName: searchValue,
          RoleName: filters.roleName || undefined,
          DepartmentName: filters.departmentName || undefined,
        });

        // ✅ fallback to LAST NAME if nothing found
        if ((response.Data?.length ?? 0) === 0) {
          response = await usersApi.list({
            Page: page,
            PageSize: pageSize,
            LastName: searchValue,
            RoleName: filters.roleName || undefined,
            DepartmentName: filters.departmentName || undefined,
          });
        }
      }

      setPeople((response.Data ?? []).map(mapUser));
      setTotal(response.Total ?? 0);

      const deptResponse = await departmentsApi.list();

      setDepartments(
        (deptResponse.Data ?? []).map((d) => ({
          id: d.Id,
          name: d.DepartmentName,
          isActive: d.IsActive,
        })),
      );

      // Fetch roles so we use real IDs from DB (avoids RoleId FK error)
      const rolesResponse = await rolesApi.list();
      const roleList = rolesResponse.Data ?? [];
      const backendToFrontend: Record<string, Person["role"]> = {
        SuperAdmin: "admin",
        Manager: "manager",
        Staff: "staff",
      };
      const labels: Record<Person["role"], string> = {
        admin: "Admin",
        manager: "Manager",
        staff: "Staff",
      };
      const map: Partial<Record<Person["role"], string>> = {};
      for (const r of roleList) {
        const key = backendToFrontend[r.RoleName];
        if (key) map[key] = r.Id;
      }
      setRoleIdMap(map);
      setAvailableRoles(
        (["admin", "manager", "staff"] as const)
          .filter((role) => map[role])
          .map((role) => ({ role, label: labels[role] })),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [page, debouncedSearch, filters.roleName, filters.departmentName]);

  async function toggleUserStatus(person: Person) {
    await usersApi.update(person.id, {
      IsActive: person.status !== "active",
    });

    await loadUsers();
  }

  const canCreatePerson = has("users.create") || has("staff.create");

  /** Manager: only staff in table and can only add/edit/delete/disable staff. Admin: all users. */
  const visiblePeople =
    effectiveRole === "manager"
      ? people.filter((p) => p.role === "staff")
      : effectiveRole === "admin"
        ? people
        : [];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  function getDepartmentId(name?: string) {
    if (!name) return undefined;
    return departments.find((d) => d.name === name)?.id;
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Page Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography level="h1" sx={{ fontSize: "2.5rem", fontWeight: 700 }}>
            People Management
          </Typography>

          <Typography level="body-sm" sx={{ color: "text.tertiary", mt: 0.5 }}>
            Manage system users and team members.
          </Typography>
        </Box>

        {canCreatePerson && (
          <Button
            color="primary"
            sx={{ mt: { xs: 1, md: 0 } }}
            onClick={() => {
              setEditingPerson(null);
              setDrawerOpen(true);
            }}
          >
            + Add Person
          </Button>
        )}
      </Box>

      <PeopleFilters
        value={filters}
        onChange={setFilters}
        currentUserRole={effectiveRole}
        departments={departments}
      />

      {/* Table */}
      <PeopleTable
        people={visiblePeople}
        loading={loading}
        onToggleStatus={toggleUserStatus}
        onEditPerson={(person) => {
          setEditingPerson(person);
          setDrawerOpen(true);
        }}
        onDeletePerson={(person) => {
          setSelectedPerson(person);
          setDeleteOpen(true);
        }}
        pagination={
          <>
            <Button
              variant="outlined"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              Page {page} of {totalPages}
            </Typography>

            <Button
              variant="outlined"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </>
        }
      />

      <PersonDrawer
        open={drawerOpen}
        mode={editingPerson ? "edit" : "create"}
        person={editingPerson}
        departments={selectableDepartments}
        availableRoles={availableRoles}
        currentUserRole={effectiveRole}
        submitError={submitError}
        onClose={() => {
          setDrawerOpen(false);
          setSubmitError(null);
        }}
        onSubmit={async (data) => {
          setSubmitError(null);
          try {
            if (editingPerson) {
              await usersApi.update(editingPerson.id, {
                FirstName: data.firstName,
                LastName: data.lastName,
                Email: data.email,
                Username: data.username?.trim() || data.email,
                RoleId: data.role ? roleIdMap[data.role] : undefined,
                DepartmentId: getDepartmentId(data.department),
                IsActive: data.status === "active",
              });
            } else {
              await usersApi.create({
                FirstName: data.firstName,
                LastName: data.lastName,
                Email: data.email,
                Username: data.username?.trim() || data.email,
                Password: "Temp123",
                RoleId: data.role ? roleIdMap[data.role] : undefined,
                DepartmentId: getDepartmentId(data.department),
                IsActive: data.status === "active",
              });
            }
            await loadUsers();
            setDrawerOpen(false);
            setEditingPerson(null);
          } catch (err) {
            setSubmitError(
              err instanceof Error ? err.message : "Failed to save user. Please try again."
            );
          }
        }}
      />

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <ModalDialog
          variant="outlined"
          role="alertdialog"
          sx={{ borderRadius: "lg", width: 420 }}
        >
          <DialogTitle>Delete user?</DialogTitle>

          <DialogContent>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              This action cannot be undone.
            </Typography>

            <Typography sx={{ mt: 1 }} fontWeight={600}>
              {selectedPerson?.firstName} {selectedPerson?.lastName}
            </Typography>

            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              sx={{ mt: 2 }}
            >
              <Button variant="outlined" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>

              <Button
                color="danger"
                onClick={async () => {
                  if (!selectedPerson) return;

                  await usersApi.remove(selectedPerson.id);
                  await loadUsers();

                  setDeleteOpen(false);
                  setSelectedPerson(null);
                }}
              >
                Delete
              </Button>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
