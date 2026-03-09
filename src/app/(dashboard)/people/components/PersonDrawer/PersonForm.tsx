"use client";

import { Box, Input, Select, Option, Button, Typography } from "@mui/joy";
import { useState, useEffect } from "react";
import { Person } from "../PeopleTable";
import { validateUser, ValidationErrors, UserFormInput } from "@/validation/user.validation";

interface Props {
  mode: "create" | "edit";
  person?: Person | null;
  currentUserRole: Person["role"];
  departments: { id: string; name: string }[];
  /** Only roles that exist in DB (from GET /api/role/list) */
  availableRoles: { role: Person["role"]; label: string }[];
  onSubmit: (data: Partial<Person>) => void;
}

export function PersonForm({
  mode,
  person,
  currentUserRole,
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
    return {
      firstName: person?.firstName ?? "",
      lastName: person?.lastName ?? "",
      email: person?.email ?? "",
      username: person?.username ?? "",
      role: person?.role ?? "staff",
      department,
      status: person?.status ?? "active",
    };
  });

  const [errors, setErrors] =
  useState<ValidationErrors<UserFormInput>>({});

  const isEditing = mode === "edit";
  const isAdminTarget = person?.role === "admin";

  // In edit mode: if user already has a department, don't allow changing to "No Department"
  const hasExistingDepartment =
    isEditing &&
    !!person?.department &&
    person.department !== "—" &&
    person.department.trim() !== "";

  // Only show roles the current user can assign and that exist in DB
  const selectableRoleOptions = availableRoles.filter(
    (r) => currentUserRole === "admin" || r.role === "staff",
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

        const validation = validateUser(form);
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

      <Input
        placeholder="Username (optional; display in sidebar when logged in; blank = use email)"
        value={form.username}
        error={!!errors.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      {errors.username && (
        <Typography level="body-xs" color="danger">
          {errors.username}
        </Typography>
      )}

      <Select
        value={selectableRoleOptions.some((r) => r.role === form.role) ? form.role : (selectableRoleOptions[0]?.role ?? "staff")}
        disabled={isEditing && isAdminTarget}
        onChange={(_, v) => {
          setForm({ ...form, role: v! });
          blurActiveElement();
        }}
      >
        {selectableRoleOptions.map((r) => (
          <Option key={r.role} value={r.role}>
            {r.label}
          </Option>
        ))}
      </Select>

      <Select
        size="md"
        placeholder="Department"
        value={form.department}
        onChange={(_, v) => {
          setForm({ ...form, department: v ?? "" });
          blurActiveElement();
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

      <Select
        value={form.status}
        disabled={isAdminTarget}
        onChange={(_, v) => {
          setForm({ ...form, status: v! });
          blurActiveElement();
        }}
      >
        <Option value="active">Active</Option>
        <Option value="inactive">Inactive</Option>
      </Select>

      <Button type="submit" sx={{ mt: "auto" }}>
        {mode === "create" ? "Create User" : "Save Changes"}
      </Button>
    </Box>
  );
}
