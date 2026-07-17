import roleModel from '../models/role.model.js';

/**
 * Middleware: require one or more permissions.
 * Reads the user's role permissions from ManagedRole table.
 */
export function requireScope(...required) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.sendStatus(401);
      const role = await roleModel.getRoleByName(req.user.role);
      const perms = role?.permissions ?? [];
      if (required.some((p) => perms.includes(p))) {
        return next();
      }
      res.status(403).json({ error: 'Insufficient permissions.' });
    } catch (error) {
      console.error(error.stack);
      res.status(500).json({ error: 'Error checking permissions' });
    }
  };
}
