import User from "../models/user.model.js";

// Get all users
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

// Get a specific user
export const getUser = async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            const error = new Error('You are not authorized to access this user.');
            error.statusCode = 403;
            throw error;
        }

        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// Create a new user (sample structure, adjust according to your registration process)
// export const createUser = async (req, res, next) => {
//     try {
//         const { username, email, password } = req.body;

//         const user = await User.create({ username, email, password });
//         res.status(201).json({ success: true, data: user });
//     } catch (error) {
//         next(error);
//     }
// };

// Update user (user can only update their own account)
export const updateUser = async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            const error = new Error('You are not authorized to update this user.');
            error.statusCode = 403;
            throw error;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');

        if (!updatedUser) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
};

// Delete user (user can only delete their own account)
export const deleteUser = async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            const error = new Error('You are not authorized to delete this user.');
            error.statusCode = 403;
            throw error;
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ success: true, message: 'User successfully deleted.' });
    } catch (error) {
        next(error);
    }
};
