const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    if (!process.env.DB_CONNECT) {
      throw new Error("DB_CONNECT is not defined in environment variables");
    }

    await mongoose.connect(process.env.DB_CONNECT);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectToDB;
