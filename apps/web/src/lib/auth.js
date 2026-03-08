const DEFAULT_ROLE_NAMESPACE = "https://healthconnect.app";

function parseUserId(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function extractRole(user) {
  if (!user) return null;

  const namespace =
    import.meta.env.VITE_AUTH0_ROLE_NAMESPACE || DEFAULT_ROLE_NAMESPACE;

  const roleClaim = user[`${namespace}/role`];
  if (typeof roleClaim === "string" && roleClaim.trim().length > 0) {
    return roleClaim.toLowerCase();
  }

  const rolesClaim = user[`${namespace}/roles`];
  if (Array.isArray(rolesClaim) && rolesClaim.length > 0) {
    const first = rolesClaim[0];
    if (typeof first === "string" && first.trim().length > 0) {
      return first.toLowerCase();
    }
  }

  return null;
}

export function resolveRoleAndUserId(user, roleOverride = null) {
  const selectedRole =
    roleOverride ||
    extractRole(user) ||
    sessionStorage.getItem("hc_intended_role") ||
    "patient";

  const roleToUserId = {
    patient: parseUserId(import.meta.env.VITE_DEV_PATIENT_USER_ID, 1),
    guardian: parseUserId(import.meta.env.VITE_DEV_GUARDIAN_USER_ID, 2),
    doctor: parseUserId(import.meta.env.VITE_DEV_DOCTOR_USER_ID, 3),
    admin: parseUserId(import.meta.env.VITE_DEV_ADMIN_USER_ID, 4),
  };

  return {
    role: selectedRole,
    userId: roleToUserId[selectedRole] ?? roleToUserId.patient,
  };
}
