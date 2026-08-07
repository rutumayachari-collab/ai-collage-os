import { useMemo } from "react";
import type { UserRole } from "../types/auth";
import { createRoleContextValue } from "../contexts/RoleContext";

export function useRoleContext(role: UserRole | null, permissions: string[]) {
  return useMemo(() => createRoleContextValue(role, permissions), [role, permissions]);
}
