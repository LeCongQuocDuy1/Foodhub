const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "user",
        },
        cart: {
            type: Array,
            default: [],
        },
        address: [{ type: mongoose.Types.ObjectId, ref: "Address" }],
        wishlist: [{ type: mongoose.Types.ObjectId, ref: "Product" }],
        isBlocked: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
        passwordChangedAt: {
            type: String,
        },
        passwordResetToken: {
            type: String,
        },
        passwordResetExpires: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// truoc khi luu thi lam gi?
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = bcrypt.genSaltSync(10);
        this.password = await bcrypt.hashSync(this.password, salt);
    }
});

userSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compareSync(password, this.password);
    },
};

//Export the model
module.exports = mongoose.model("User", userSchema);
