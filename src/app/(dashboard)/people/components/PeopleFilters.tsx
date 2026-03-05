"use client";

import { Box, Input, Select, Option } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";

export interface PeopleFiltersValue {
  search: string;
  roleName: string;
  departmentName: string;
}

interface Props {
  value: PeopleFiltersValue;
  onChange: (value: PeopleFiltersValue) => void;
  currentUserRole: "admin" | "manager" | "staff";
  departments: { id: string; name: string; isActive: boolean }[];
}

export function PeopleFilters({
  value,
  onChange,
  currentUserRole,
  departments,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        mb: 2,
      }}
    >
      {/* Search */}
      <Input
        startDecorator={<SearchIcon />}
        placeholder="Search users..."
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        sx={{ minWidth: 260 }}
      />

      {/* Role filter */}
      <Select
        placeholder="Role"
        value={value.roleName}
        onChange={(_, val) =>
          onChange({ ...value, roleName: (val as string) ?? "" })
        }
        sx={{ minWidth: 160 }}
      >
        <Option value="">All Roles</Option>
        {currentUserRole === "admin" && <Option value="admin">Admin</Option>}

        {currentUserRole === "admin" && (
          <Option value="manager">Manager</Option>
        )}

        <Option value="staff">Staff</Option>
      </Select>

      {/* Department filters */}
      <Select
        placeholder="Department"
        value={value.departmentName}
        onChange={(_, val) =>
          onChange({ ...value, departmentName: (val as string) ?? "" })
        }
        sx={{ minWidth: 180 }}
      >
        <Option value="">All Departments</Option>

        {departments.map((d) => (
          <Option key={d.id} value={d.name}>
            {d.name}
          </Option>
        ))}
      </Select>

      {/* Status filter */}
      {/* <Select
        placeholder="Status"
        value={value.status}
        onChange={(_, val) => onChange({ ...value, status: val ?? "" })}
        sx={{ minWidth: 160 }}
      >
        <Option value="">All Status</Option>
        <Option value="active">Active</Option>
        <Option value="inactive">Inactive</Option>
      </Select> */}
    </Box>
  );
}
