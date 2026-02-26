"use client";

import { Box, Input, Select, Option, Button } from "@mui/joy";
import { useState, useEffect } from "react";
import { Person } from "../PeopleTable";

interface Props {
  mode: "create" | "edit";
  person?: Person | null;
  currentUserRole: Person["role"];
  departments: { id: string; name: string }[];
  onSubmit: (data: Partial<Person>) => void;
}

export function PersonForm({
  mode,
  person,
  currentUserRole,
  departments,
  onSubmit,
}: Props) {
  // preload edit values
  type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    role: Person["role"];
    department: string;
    status: Person["status"];
  };

  const [form, setForm] = useState<FormState>(() => ({
    firstName: person?.firstName ?? "",
    lastName: person?.lastName ?? "",
    email: person?.email ?? "",
    role: person?.role ?? "staff",
    department: person?.department ?? "",
    status: person?.status ?? "active",
  }));

  const isEditing = mode === "edit";
  const isAdminTarget = person?.role === "admin";

  // useEffect(() => {
  //   setForm({
  //     name: person?.name ?? "",
  //     email: person?.email ?? "",
  //     role: person?.role ?? "staff",
  //     status: person?.status ?? "active",
  //   });
  // }, [person]);

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();

        if (
          !form.firstName.trim() ||
          !form.lastName.trim() ||
          !form.email.trim()
        )
          return;

        onSubmit({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
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
        autoFocus
        placeholder="First Name"
        value={form.firstName}
        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        required
      />

      <Input
        placeholder="Last name"
        value={form.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        required
      />

      <Input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <Select
        value={form.role}
        disabled={isEditing && isAdminTarget}
        onChange={(_, v) => setForm({ ...form, role: v! })}
      >
        {currentUserRole === "admin" && <Option value="admin">Admin</Option>}

        {currentUserRole === "admin" && (
          <Option value="manager">Manager</Option>
        )}

        <Option value="staff">Staff</Option>
      </Select>

      <Select
        size="md"
        placeholder="Department"
        value={form.department}
        onChange={(_, v) => setForm({ ...form, department: v ?? "" })}
      >
        <Option value="">No Department</Option>

        {departments.map((d) => (
          <Option key={d.id} value={d.name}>
            {d.name}
          </Option>
        ))}
      </Select>

      <Select
        value={form.status}
        disabled={isAdminTarget}
        onChange={(_, v) => setForm({ ...form, status: v! })}
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
