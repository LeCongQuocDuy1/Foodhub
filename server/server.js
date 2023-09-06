const express = require("express");
const dbConnect = require("./config/dbConnect");
const initRoutes = require("./route/");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 1234;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dbConnect();
initRoutes(app);

app.listen(port, () => {
    console.log("Server is running on port " + port);
});
