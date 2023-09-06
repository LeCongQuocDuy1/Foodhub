const router = require("express").Router();
const userController = require("../controller/user");

router.post("/register", userController.register);

module.exports = router;
