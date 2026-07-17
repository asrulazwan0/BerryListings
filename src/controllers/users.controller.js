import { validationResult } from 'express-validator';
import userModel from '../models/user.model.js';

const createUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const { email, role } = req.body;
        const result = await userModel.createUser(email, role);
        res.status(201).json({ message: 'User created successfully', data: result });
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ error: 'A user with this email already exists' });
        console.error(error.stack);
        res.status(500).json({ error: 'Error creating user' });
    }
};

const getUserList = async (req, res) => {
    try {
        const userList = await userModel.getUserList();
        res.json({ message: 'get user list', data: userList });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ error: 'Error fetching user list' });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userModel.getUserByUuid(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `get user id ${id}`, data: user });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const { email, isEnabled, role } = req.body;
        const user = await userModel.getUserByUuid(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent self-disable
        if (isEnabled === false && user.email === req.user.email) {
            return res.status(403).json({ error: 'Cannot disable your own account.' });
        }

        // Prevent demoting the last admin
        if (role && role !== 'ADMIN' && user.role === 'ADMIN') {
            const adminCount = await userModel.countEnabledAdmins();
            if (adminCount <= 1) {
                return res.status(403).json({ error: 'Cannot demote the last admin.' });
            }
        }

        // Prevent disabling the last admin
        if (isEnabled === false && user.role === 'ADMIN') {
            const adminCount = await userModel.countEnabledAdmins();
            if (adminCount <= 1) {
                return res.status(403).json({ error: 'Cannot disable the last admin.' });
            }
        }

        const result = await userModel.updateUser(user, { email, isEnabled, role });
        res.json({ message: `User with id ${id} updated successfully`, data: result });
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ error: 'A user with this email already exists' });
        console.error(error.stack);
        res.status(500).json({ error: 'Error updating user' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userModel.getUserByUuid(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent self-delete
        if (user.email === req.user.email) {
            return res.status(403).json({ error: 'Cannot delete your own account.' });
        }

        // Prevent deleting the last admin
        if (user.role === 'ADMIN') {
            const adminCount = await userModel.countEnabledAdmins();
            if (adminCount <= 1) {
                return res.status(403).json({ error: 'Cannot delete the last admin. Promote another user to admin first.' });
            }
        }

        await userModel.deleteUser(user.uuid);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
};

export default { createUser, getUserList, getUserById, updateUser, deleteUser };
