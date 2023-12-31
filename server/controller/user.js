const User = require("../model/User");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const {
    generateAccessToken,
    generateRefreshToken,
} = require("../middleware/jwt");
const sendMail = require("../ultil/sendMail");
const crypto = require("crypto");

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

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (!email) throw new Error("Missing email!");
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found!");
    const resetToken = await user.createPasswordChangedToken();
    await user.save();

    const html = `
    <!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Reset Password Email Template</title>
        <meta name="description" content="Reset Password Email Template." />
        <style type="text/css">
            a:hover {
                text-decoration: underline !important;
            }
        </style>
    </head>

    <body
        marginheight="0"
        topmargin="0"
        marginwidth="0"
        style="margin: 0px; background-color: #f2f3f8"
        leftmargin="0"
    >
        <!--100% body table-->
        <table
            cellspacing="0"
            border="0"
            cellpadding="0"
            width="100%"
            bgcolor="#f2f3f8"
            style="
                @import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700);
                font-family: 'Open Sans', sans-serif;
            "
        >
            <tr>
                <td>
                    <table
                        style="
                            background-color: #f2f3f8;
                            max-width: 670px;
                            margin: 0 auto;
                        "
                        width="100%"
                        border="0"
                        align="center"
                        cellpadding="0"
                        cellspacing="0"
                    >
                        <tr>
                            <td style="height: 80px">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="text-align: center">
                                <a
                                    href="https://rakeshmandal.com"
                                    title="logo"
                                    target="_blank"
                                >
                                    <img
                                        width="100"
                                        src="https://cdn.abphotos.link/photos/resized/320x/2023/06/05/1685934196_z8dwxTykHmXhUEZc_1685936727-phpgmatgn.png"
                                        title="logo"
                                        alt="logo"
                                    />
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 20px">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>
                                <table
                                    width="95%"
                                    border="0"
                                    align="center"
                                    cellpadding="0"
                                    cellspacing="0"
                                    style="
                                        max-width: 670px;
                                        background: #fff;
                                        border-radius: 3px;
                                        text-align: center;
                                        -webkit-box-shadow: 0 6px 18px 0
                                            rgba(0, 0, 0, 0.06);
                                        -moz-box-shadow: 0 6px 18px 0
                                            rgba(0, 0, 0, 0.06);
                                        box-shadow: 0 6px 18px 0
                                            rgba(0, 0, 0, 0.06);
                                    "
                                >
                                    <tr>
                                        <td style="height: 40px">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 35px">
                                            <h1
                                                style="
                                                    color: #1e1e2d;
                                                    font-weight: 500;
                                                    margin: 0;
                                                    font-size: 32px;
                                                    font-family: 'Rubik',
                                                        sans-serif;
                                                "
                                            >
                                                You have requested to reset your
                                                password
                                            </h1>
                                            <span
                                                style="
                                                    display: inline-block;
                                                    vertical-align: middle;
                                                    margin: 29px 0 26px;
                                                    border-bottom: 1px solid
                                                        #cecece;
                                                    width: 100px;
                                                "
                                            ></span>
                                            <p
                                                style="
                                                    color: #455056;
                                                    font-size: 15px;
                                                    line-height: 24px;
                                                    margin: 0;
                                                "
                                            >
                                            Please click on the link below to change your password. This link will expire 15 minutes from now.
                                            </p>
                                            <a
                                                href=${process.env.URL_SERVER}/api/v1/user/resetpassword/${resetToken}
                                                style="
                                                    background: #20e277;
                                                    text-decoration: none !important;
                                                    font-weight: 500;
                                                    margin-top: 35px;
                                                    color: #fff;
                                                    text-transform: uppercase;
                                                    font-size: 14px;
                                                    padding: 10px 24px;
                                                    display: inline-block;
                                                    border-radius: 50px;
                                                "
                                                >Reset Password</a
                                            >
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height: 40px">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td style="height: 20px">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="text-align: center">
                                <p
                                    style="
                                        font-size: 14px;
                                        color: rgba(
                                            69,
                                            80,
                                            86,
                                            0.7411764705882353
                                        );
                                        line-height: 18px;
                                        margin: 0 0 0;
                                    "
                                >
                                    &copy; <strong>www.foodhub.com</strong>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 80px">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <!--/100% body table-->
    </body>
    </html>`;

    const rs = await sendMail({ email, html });

    return res.status(200).json({
        success: rs ? true : false,
        rs,
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body;
    if (!password || !token) throw new Error("Missing inputs");
    const passwordResetToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const user = await User.findOne({
        passwordResetToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Invalid reset token");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordChangedAt = Date.now();
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
        success: user ? true : false,
        message: user
            ? "Updated password successfully!"
            : "Something went wrong!",
    });
});

module.exports = {
    register,
    login,
    getCurrent,
    resetAccessToken,
    logout,
    forgotPassword,
    resetPassword,
};
