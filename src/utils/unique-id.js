import { v4 } from 'uuid';

const generateUniqueId = () => 
{
    return v4();
};

export default generateUniqueId;
