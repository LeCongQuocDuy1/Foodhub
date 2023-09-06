const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI);

        // ready states being:
        // 0: disconnected
        // 1: connected
        // 2: connecting
        // 3: disconnecting

        if (connect.connection.readyState === 1) {
            console.log("DB connection is successfully!");
        } else {
            console.log("Db connection is failed !");
        }
    } catch (error) {
        console.log("Db connection is error !");
        throw new Error(error);
    }
};

module.exports = dbConnect;
