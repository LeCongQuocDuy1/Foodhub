const userRouter = require("./user");

const initRoutes = (app) => {
    app.use("/api/v1/user", userRouter);
};

module.exports = initRoutes;
