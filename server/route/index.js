const userRouter = require("./user");
const { notFound, errorHandler } = require("../middleware/errorHandler");

const initRoutes = (app) => {
    app.use("/api/v1/user", userRouter);

    app.use(notFound);
    app.use(errorHandler);
};

module.exports = initRoutes;
