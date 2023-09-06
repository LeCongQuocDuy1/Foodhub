const User = require("../model/User");
const asyncHandler = require("express-async-handler");

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing input!",
        });
    }

    const response = await User.create(req.body);
    return res.status(200).json({
        success: response ? true : false,
        response,
        message: "User created successfully!",
    });
});

module.exports = {
    register,
};
