import { useRole } from "../contexts/RoleContext";

export function usePermissions() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, permissions } = useRole();
  return { hasPermission, hasAnyPermission, hasAllPermissions, permissions };
}
