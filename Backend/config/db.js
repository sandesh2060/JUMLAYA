// ============================================
// Backend/config/db.js (PRODUCTION-READY)
// Replace your current db.js with this
// ============================================

const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    // Validate environment variable
    if (!process.env.DB_CONNECT) {
      throw new Error("❌ DB_CONNECT is not defined in environment variables");
    }

    console.log("📡 Connecting to MongoDB...");

    // Connection options
    const options = {
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 2,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
      connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: "majority",
    };

    // Set strictQuery option
    mongoose.set("strictQuery", true);

    // Connect to MongoDB
    await mongoose.connect(process.env.DB_CONNECT, options);

    console.log("✅ MongoDB Connected Successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port || 'N/A'}`);

    // Connection event handlers
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected successfully");
    });

    mongoose.connection.on("close", () => {
      console.log("📪 MongoDB connection closed");
    });

  } catch (error) {
    console.error("\n" + "=".repeat(50));
    console.error("❌ MongoDB Connection Failed");
    console.error("=".repeat(50));
    console.error("Message:", error.message);
    console.error("Code:", error.code || "N/A");
    
    // Provide helpful error messages
    if (error.message.includes("ECONNREFUSED")) {
      console.error("\n💡 Connection Refused Error:");
      console.error("   - If using MongoDB Atlas: Check your internet connection");
      console.error("   - If using local MongoDB: Make sure MongoDB is running");
      console.error("   - Verify the connection string in your .env file");
    } else if (error.message.includes("authentication failed")) {
      console.error("\n💡 Authentication Failed:");
      console.error("   - Check your database username and password");
      console.error("   - Verify credentials in your .env file");
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.error("\n💡 Host Not Found:");
      console.error("   - Check your internet connection");
      console.error("   - Verify the cluster URL in your .env file");
      console.error("   - Make sure the database URL is correct");
    } else if (error.message.includes("timeout")) {
      console.error("\n💡 Connection Timeout:");
      console.error("   - Check your internet connection");
      console.error("   - Verify IP whitelist in MongoDB Atlas");
      console.error("   - Try increasing the timeout in .env");
    }
    
    console.error("\n📝 Current Connection String (hidden password):");
    const safeConnectionString = process.env.DB_CONNECT.replace(/:([^:@]+)@/, ':****@');
    console.error("  ", safeConnectionString);
    console.error("=".repeat(50) + "\n");
    
    // Exit process on connection failure
    process.exit(1);
  }
};

module.exports = connectToDB;