import roleModel from '../models/role.model.js';

const getRoles = async (req, res) => {
  try {
    const roles = await roleModel.getRoles();
    res.json({ message: 'get roles', data: roles });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: 'Error fetching roles' });
  }
};

const saveRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    if (!name || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'name and permissions[] required' });
    }
    const result = await roleModel.upsertRole(name, permissions);
    res.json({ message: 'Role saved', data: result });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: 'Error saving role' });
  }
};

const deleteRole = async (req, res) => {
  try {
    await roleModel.deleteRole(req.params.name);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Role not found' });
    res.status(500).json({ error: 'Error deleting role' });
  }
};

export default { getRoles, saveRole, deleteRole };
