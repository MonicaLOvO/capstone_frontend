import { ApiUser } from "./users.types";
import { Person } from "@/app/(dashboard)/people/components/PeopleTable";

// Mapper converts backend to frontend shape ....
export function mapUser(dto: ApiUser): Person {
  const roleName = dto.Role?.RoleName?.toLowerCase();

  let role: Person["role"] = "staff";

  if (roleName === "superadmin") role = "admin";
  else if (roleName === "manager") role = "manager";

  return {
    id: dto.Id,
    firstName: dto.FirstName ?? "",
    lastName: dto.LastName ?? "",
    email: dto.Email,
    role,

    // department: dto.Department?.DepartmentName ?? "",
    // departmentActive: dto.Department?.IsActive ?? true,
    department: dto.Department?.DepartmentName ?? "—",

    status: dto.IsActive ? "active" : "inactive",

    createdAt: dto.CreatedAt
      ? new Date(dto.CreatedAt).toLocaleDateString()
      : "",
  };
}
