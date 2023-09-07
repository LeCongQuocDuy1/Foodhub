const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendMail = asyncHandler(async ({ email, html }) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    let info = await transporter.sendMail({
        from: '"Foodhub - Thực phẩm sơ chế theo yêu cầu 🥩🦐🌮🥑" <no-reply@foodhub.com>', // sender address
        to: email, // list of receivers
        subject: "You have requested to reset your password !", // Subject line
        html: html, // html body
    });

    return info;
});

module.exports = sendMail;
