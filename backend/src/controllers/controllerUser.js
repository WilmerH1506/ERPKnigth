import users from '../models/users.js';

export const getUsers = async (req, res) => {
    try {
        const allUsers = await users.find();
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
    };

export const registerUser = async (req, res) => {
    const {Usuario,Password} = req.body;
    const newUser = new users({Usuario,Password});
    try {
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};