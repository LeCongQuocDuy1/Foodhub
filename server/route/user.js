const router = require("express").Router();
const userController = require("../controller/user");
const { verifyAccessToken } = require("../middleware/verifyToken");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/current", verifyAccessToken, userController.getCurrent);
router.get("/refreshtoken", userController.resetAccessToken);
router.get("/logout", userController.logout);

module.exports = router;
