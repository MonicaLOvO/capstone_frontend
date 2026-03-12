import { ApiUser } from "./users.types";
import { Person } from "@/app/(dashboard)/people/components/PeopleTable";

function normalizeBackendRoleName(name: string | undefined): Person["backendRoleName"] {
  const lower = name?.toLowerCase();
  if (lower === "superadmin") return "SuperAdmin";
  if (lower === "admin") return "Admin";
  if (lower === "manager") return "Manager";
  if (lower === "staff") return "Staff";
  return "Staff";
}

// Mapper converts backend to frontend shape ....
export function mapUser(dto: ApiUser): Person {
  const roleName = dto.Role?.RoleName?.toLowerCase();

  let role: Person["role"] = "staff";

  if (roleName === "superadmin" || roleName === "admin") role = "admin";
  else if (roleName === "manager") role = "manager";

  return {
    id: dto.Id,
    firstName: dto.FirstName ?? "",
    lastName: dto.LastName ?? "",
    email: dto.Email,
    username: dto.Username ?? undefined,
    role,
    backendRoleName: normalizeBackendRoleName(dto.Role?.RoleName),

    department: dto.Department?.DepartmentName ?? "—",

    status: dto.IsActive ? "active" : "inactive",

    createdAt: dto.CreatedAt
      ? new Date(dto.CreatedAt).toLocaleDateString()
      : "",
  };
}
