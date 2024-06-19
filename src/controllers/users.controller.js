import userModel from '../models/user.model.js';

const createUser = async (req, res) =>
{
    try 
    {
        const { email } = req.body;
        const result = await userModel.createUser(email);
    
        res.status(201).json({ message: 'User created successfully', data: result });
    } 
    catch (error) 
    {
        res.status(500).json({ error: 'Error creating user' });
    }
};

const getUserList = async (req, res) =>
{
    const userList = await userModel.getUserList();
    res.json({ message: 'get user list', data: userList });
};

const getUserById = async (req, res) =>
{
    const { id } = req.params;
    const user = await userModel.getUserByUuid(id);

    if (!user) 
    {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `get user id ${id}`, data: user });
};

const updateUser = async (req, res) => 
{
    const { id } = req.params;

    try 
    {
        const { email, isEnabled } = req.body;
        const user = await userModel.getUserByUuid(id);
    
        if (!user) 
        {
            return res.status(404).json({ message: 'User not found' });
        }

        const result = await userModel.updateUser(user, { email, isEnabled });

        res.json({ message: `User with id ${id} updated successfully`, data: result });
    }
    catch (error) 
    {
        console.log(error)
        res.status(500).json({ error: `Error updating user id ${id}` });
    }
};

const deleteUser = async (req, res) => 
{
    const { id } = req.params;

    try 
    {
        const user = await userModel.getUserByUuid(id);
    
        if (!user) 
        {
            return res.status(404).json({ message: 'User not found' });
        }

        await userModel.deleteUser(user.uuid);

        res.status(204).send();
    } 
    catch (error) 
    {
        res.status(500).json({ error: `Error deleting user id ${id}` });
    }
};

export default 
{
    createUser,
    getUserList,
    getUserById,
    updateUser,
    deleteUser
};