"use client";

import { Box, Input, Select, Option, Button, Typography } from "@mui/joy";
import { useState, useEffect } from "react";
import { Person, type BackendRoleName } from "../PeopleTable";
import { validateUser, ValidationErrors, UserFormInput } from "@/validation/user.validation";

interface Props {
  mode: "create" | "edit";
  person?: Person | null;
  currentUserRole: Person["role"];
  /** Backend role of current user – only SuperAdmin can change another Admin's role/status */
  currentUserBackendRole?: BackendRoleName;
  departments: { id: string; name: string }[];
  /** Only roles that exist in DB (from GET /api/role/list) */
  availableRoles: { role: Person["role"]; label: string }[];
  onSubmit: (data: Partial<Person>) => void;
}

export function PersonForm({
  mode,
  person,
  currentUserRole,
  currentUserBackendRole,
  departments,
  availableRoles,
  onSubmit,
}: Props) {
  // preload edit values
  type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: Person["role"];
    department: string;
    status: Person["status"];
  };

  const [form, setForm] = useState<FormState>(() => {
    const dept = person?.department ?? "";
    const department = dept && dept !== "—" ? dept : "";
    // If username is missing or same as email (backend fallback), show empty so validation passes and we keep "use email"
    const rawUsername = person?.username ?? "";
    const username =
      !rawUsername || rawUsername === person?.email ? "" : rawUsername;
    return {
      firstName: person?.firstName ?? "",
      lastName: person?.lastName ?? "",
      email: person?.email ?? "",
      username,
      role: person?.role ?? "staff",
      department,
      status: person?.status ?? "active",
    };
  });

  const [errors, setErrors] =
  useState<ValidationErrors<UserFormInput>>({});

  const isEditing = mode === "edit";
  const isAdminTarget = person?.role === "admin";
  // Only SuperAdmin may change another Admin's role/status; Admin cannot edit other Admins' role/status
  const isSuperAdmin = currentUserBackendRole === "SuperAdmin";
  const disableRoleAndStatusForTarget =
    isAdminTarget && !isSuperAdmin;

  // In edit mode: if user already has a department, don't allow changing to "No Department"
  const hasExistingDepartment =
    isEditing &&
    !!person?.department &&
    person.department !== "—" &&
    person.department.trim() !== "";

  // Only SuperAdmin can assign Admin role; Admin can assign Manager/Staff only; Manager can assign Staff only.
  const selectableRoleOptions = availableRoles.filter((r) =>
    currentUserBackendRole === "SuperAdmin"
      ? true
      : currentUserBackendRole === "Admin"
        ? r.role !== "admin"
        : currentUserRole === "manager"
          ? r.role === "staff"
          : false,
  );

  // Move focus off the listbox option before it closes to avoid "Blocked aria-hidden" a11y warning
  const blurActiveElement = () => {
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();

        const requireUsername =
          isEditing &&
          !!person?.username?.trim() &&
          person.username.trim() !== person?.email?.trim();
        const validation = validateUser(form, { requireUsername });
        setErrors(validation);

        if (Object.keys(validation).length > 0) return;

        onSubmit({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          username: form.username.trim() || undefined,
          role: form.role,
          department: form.department,
          status: form.status,
        });
      }}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 1,
      }}
    >
      <Input
        placeholder="First Name"
        value={form.firstName}
        error={!!errors.firstName}
        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
      />
      {errors.firstName && (
        <Typography level="body-xs" color="danger">
          {errors.firstName}
        </Typography>
      )}

      <Input
        placeholder="Last name"
        value={form.lastName}
        error={!!errors.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        required
      />
      {errors.lastName && (
        <Typography level="body-xs" color="danger">
          {errors.lastName}
        </Typography>
      )}

      <Input
        type="email"
        placeholder="Email"
        value={form.email}
        error={!!errors.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      {errors.email && (
        <Typography level="body-xs" color="danger">
          {errors.email}
        </Typography>
      )}
      {/* (display in sidebar when logged in; blank = use email) */}
      <Input
        placeholder="Username (optional)"
        value={form.username}
        error={!!errors.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      {errors.username && (
        <Typography level="body-xs" color="danger">
          {errors.username}
        </Typography>
      )}

      {/* Role / Department / Status */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, color: "text.secondary" }}>
            Role
          </Typography>
          <Select
            value={
              selectableRoleOptions.some((r) => r.role === form.role)
                ? form.role
                : selectableRoleOptions[0]?.role ?? "staff"
            }
            disabled={isEditing && disableRoleAndStatusForTarget}
            onChange={(_, v) => {
              setForm({ ...form, role: v! });
              blurActiveElement();
            }}
            slotProps={{
              listbox: {
                placement: "bottom-start",
                sx: { width: "var(--Select-triggerWidth)", maxWidth: "100%" },
              },
            }}
          >
            {selectableRoleOptions.map((r) => (
              <Option key={r.role} value={r.role}>
                {r.label}
              </Option>
            ))}
          </Select>
        </Box>

        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, color: "text.secondary" }}>
            Department
          </Typography>
          <Select
            size="md"
            placeholder="Department"
            value={form.department}
            onChange={(_, v) => {
              setForm({ ...form, department: v ?? "" });
              blurActiveElement();
            }}
            slotProps={{
              listbox: {
                placement: "bottom-start",
                sx: { width: "var(--Select-triggerWidth)", maxWidth: "100%" },
              },
            }}
          >
            <Option value="" disabled={hasExistingDepartment}>
              No Department
            </Option>

            {departments.map((d) => (
              <Option key={d.id} value={d.name}>
                {d.name}
              </Option>
            ))}
          </Select>
        </Box>

        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5, color: "text.secondary" }}>
            Status
          </Typography>
          <Select
            value={form.status}
            disabled={isEditing && disableRoleAndStatusForTarget}
            onChange={(_, v) => {
              setForm({ ...form, status: v! });
              blurActiveElement();
            }}
            slotProps={{
              listbox: {
                placement: "bottom-start",
                sx: { width: "var(--Select-triggerWidth)", maxWidth: "100%" },
              },
            }}
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Box>
      </Box>

      <Button type="submit" sx={{ mt: "auto" }}>
        {mode === "create" ? "Create User" : "Save Changes"}
      </Button>
    </Box>
  );
}
