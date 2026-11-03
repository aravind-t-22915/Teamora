// src/hooks/usePermissions.ts
import { useAuthStore } from '../stores/authStore';

/**
 * Convenience hook for permission checks and role flags.
 *
 * `can(permission)` delegates to the authStore's RBAC logic.
 * `isCoach` and `isStaff` are short-circuit helpers used throughout the UI.
 */
export function usePermissions() {
  const can    = useAuthStore(s => s.can);
  const role   = useAuthStore(s => s.user?.role ?? null);
  const isCoach = role === 'coach';
  const isStaff = role === 'coach' || role === 'assistant_coach' || role === 'manager';

  return { can, role, isCoach, isStaff };
}
