const User = require("../model/User");
const asyncHandler = require("express-async-handler");

const register = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({
            success: false,
            message: "Missing input!",
        });
    }

    const user = await User.findOne({ email });

    if (user) {
        throw new Error("User has existed!");
    } else {
        const response = await User.create(req.body);
        return res.status(200).json({
            success: response ? true : false,
            response,
            message: response
                ? "User created successfully. Please go login!"
                : "User created failed!",
        });
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("Missing inputs!");
    const response = await User.findOne({ email });
    const checkPassword = await response.isCorrectPassword(password);
    if (!response) {
        throw new Error("This account does not exist! Please register user!");
    } else if (!checkPassword) {
        throw new Error("Password is wrong. Please enter again!");
    } else {
        const { password, role, ...rest } = response.toObject();
        return res.status(200).json({
            success: true,
            response: rest,
            message: "Login successfully! Welcome to!",
        });
    }
});

const getAllUsers = asyncHandler(async (req, res) => {});

module.exports = {
    register,
    login,
};
