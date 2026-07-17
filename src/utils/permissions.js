/** Permission constants and helpers */

const PERMISSIONS = {
  PROPERTIES_CREATE: 'properties:create',
  PROPERTIES_EDIT: 'properties:edit',
  PROPERTIES_DELETE: 'properties:delete',
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
};

/** Default permission sets per role */
const ROLE_PERMISSIONS = {
  ADMIN: [
    PERMISSIONS.PROPERTIES_CREATE, PERMISSIONS.PROPERTIES_EDIT, PERMISSIONS.PROPERTIES_DELETE,
    PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT, PERMISSIONS.USERS_DELETE,
  ],
  USER: [
    PERMISSIONS.PROPERTIES_CREATE, PERMISSIONS.PROPERTIES_EDIT,
  ],
};

/** Check if a user has a specific permission */
function hasPermission(user, perm) {
  const userPerms = user.permissions ?? [];
  if (userPerms.length > 0) return userPerms.includes(perm);
  return (ROLE_PERMISSIONS[user.role] ?? []).includes(perm);
}

export { PERMISSIONS, ROLE_PERMISSIONS, hasPermission };
