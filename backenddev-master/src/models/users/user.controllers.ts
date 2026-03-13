import { Request, Response } from 'express';
import { ApiError } from '../../utils/apiError';

const registerUser = async (req: Request, res: Response) => {
    const { email, first_name, last_name, role, password } = req.body;

    if (
        [email, first_name, last_name, role, password].some((field) => typeof field !== 'string' || field.trim() === '')
    ) {
        throw new ApiError(400, 'All fields are required');
    }

    // Placeholder: real implementation should create user in DB
    const user = {
        id: 'temp-id',
        email,
        role,
        profile: {
            firstName: first_name,
            lastName: last_name
        },
        createdAt: new Date(),
        updatedAt: new Date()
    };

    res.status(201).json({ success: true, data: { user } });
};

export { registerUser };