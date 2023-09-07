const User = require("../model/User");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const {
    generateAccessToken,
    generateRefreshToken,
} = require("../middleware/jwt");

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
        const accessToken = generateAccessToken(response._id, role);
        const refreshToken = generateRefreshToken(response._id);

        await User.findByIdAndUpdate(
            response._id,
            { refreshToken },
            { new: true }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            response: rest,
            accessToken,
            message: "Login successfully! Welcome to!",
        });
    }
});

const getCurrent = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const response = await User.findById(_id).select(
        "-role -password -refreshToken"
    );
    return res.status(200).json({
        success: false,
        response: response ? response : "User not found!",
    });
});

const resetAccessToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie && !cookie.refreshToken)
        throw new Error("No refresh token in cookies!");

    const rs = jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
    const response = await User.findOne({
        _id: rs._id,
        refreshToken: cookie.refreshToken,
    });
    return res.status(200).json({
        success: response ? true : false,
        response: response
            ? generateAccessToken(response._id, response.role)
            : "Refresh token not matched!",
    });
});

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie || !cookie.refreshToken)
        throw new Error("No refresh token in cookies!");
    await User.findOneAndUpdate(
        { refreshToken: cookie.refreshToken },
        { refreshToken: "" },
        { new: true }
    );
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });

    return res.status(200).json({
        success: true,
        message: "Log out successfully!",
    });
});

module.exports = {
    register,
    login,
    getCurrent,
    resetAccessToken,
    logout,
};
