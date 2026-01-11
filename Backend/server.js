// ============================================
// Backend/server.js (CORRECTED - PRODUCTION-READY)
// ============================================
require("dotenv").config();
const http = require("http");
const app = require("./app"); // ✅ Import Express app (CORS already configured in app.js)
const connectToDB = require("./config/db");

// =====================================================
// ENVIRONMENT VALIDATION
// =====================================================
const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "DB_CONNECT",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET"
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error("\n💡 Tip: Check your .env file!");
  process.exit(1);
}

// Validate JWT secrets strength
if (process.env.JWT_SECRET.length < 32) {
  console.error("❌ JWT_SECRET must be at least 32 characters long!");
  console.error("💡 Current length:", process.env.JWT_SECRET.length);
  process.exit(1);
}

if (process.env.JWT_REFRESH_SECRET.length < 32) {
  console.error("❌ JWT_REFRESH_SECRET must be at least 32 characters long!");
  console.error("💡 Current length:", process.env.JWT_REFRESH_SECRET.length);
  process.exit(1);
}

// =====================================================
// SERVER CONFIGURATION
// =====================================================
const PORT = process.env.PORT || 4001;
const HOST = process.env.HOST || "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production";

let server;

// =====================================================
// GRACEFUL SHUTDOWN HANDLER
// =====================================================
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);
  
  if (!server) {
    process.exit(0);
  }
  
  server.close(() => {
    console.log("✅ HTTP server closed");
    
    // Close database connection
    require("mongoose").connection.close(false, () => {
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// =====================================================
// START SERVER
// =====================================================
const startServer = async () => {
  try {
    // Connect to database first
    await connectToDB();
    
    // Create HTTP server
    server = http.createServer(app);
    
    // Start listening
    server.listen(PORT, HOST, () => {
      console.clear();
      console.log("\n" + "=".repeat(50));
      console.log("🚀 JUMLAYA Backend Server Started Successfully");
      console.log("=".repeat(50));
      console.log(`🌍 Environment:     ${process.env.NODE_ENV}`);
      console.log(`🚀 Server URL:      http://${HOST}:${PORT}`);
      console.log(`📍 API Base URL:    http://${HOST}:${PORT}/api`);
      console.log(`💾 Database:        Connected`);
      console.log(`🔒 CORS:            ${isProduction ? "Production (Vercel only)" : "Development (localhost)"}`);
      console.log(`⏰ Started at:      ${new Date().toLocaleString()}`);
      console.log("=".repeat(50));
      
      if (!isProduction) {
        console.log("\n💡 Quick Links:");
        console.log(`   🌐 Frontend:       http://localhost:5173`);
        console.log(`   ❤️  Health Check:   http://localhost:${PORT}/api/health`);
        console.log(`   📚 API Root:       http://localhost:${PORT}/`);
        console.log("\n💡 Tips:");
        console.log("   - Press Ctrl+C to stop the server");
        console.log("   - Check logs above for any warnings");
        console.log("   - Make sure Frontend is running on port 5173\n");
      } else {
        console.log("\n🌐 Production Mode Active");
        console.log(`   CORS: Allowing *.vercel.app domains`);
        console.log(`   Rate Limiting: Enabled`);
        console.log(`   Security Headers: Enabled\n`);
      }
    });
    
    // Handle server errors
    server.on("error", (error) => {
      console.error("\n" + "=".repeat(50));
      console.error("❌ SERVER ERROR");
      console.error("=".repeat(50));
      
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use!`);
        console.error("\n💡 Solutions:");
        console.error(`   1. Kill the process: lsof -ti:${PORT} | xargs kill -9`);
        console.error(`   2. Or use a different port in your .env file`);
        console.error(`   3. Or find and stop the other process using this port`);
      } else if (error.code === "EACCES") {
        console.error(`Permission denied to use port ${PORT}`);
        console.error("\n💡 Solution: Try using a port number above 1024");
      } else {
        console.error("Message:", error.message);
        console.error("Code:", error.code);
      }
      
      console.error("=".repeat(50) + "\n");
      process.exit(1);
    });
    
  } catch (error) {
    console.error("\n" + "=".repeat(50));
    console.error("❌ FAILED TO START SERVER");
    console.error("=".repeat(50));
    console.error("Message:", error.message);
    
    if (error.message.includes("ECONNREFUSED") || error.message.includes("connect")) {
      console.error("\n💡 Database Connection Error!");
      console.error("   - Check if MongoDB is running");
      console.error("   - Verify DB_CONNECT in your .env file");
      console.error("   - Check your internet connection (for MongoDB Atlas)");
    }
    
    if (!isProduction && error.stack) {
      console.error("\nStack Trace:", error.stack);
    }
    
    console.error("=".repeat(50) + "\n");
    process.exit(1);
  }
};

// =====================================================
// PROCESS EVENT HANDLERS
// =====================================================

// Handle graceful shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("\n" + "=".repeat(50));
  console.error("💥 UNCAUGHT EXCEPTION");
  console.error("=".repeat(50));
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);
  console.error("=".repeat(50) + "\n");
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("\n" + "=".repeat(50));
  console.error("💥 UNHANDLED PROMISE REJECTION");
  console.error("=".repeat(50));
  console.error("Reason:", reason);
  console.error("Promise:", promise);
  console.error("=".repeat(50) + "\n");
  gracefulShutdown("UNHANDLED_REJECTION");
});

// Handle warnings (only in development)
process.on("warning", (warning) => {
  if (!isProduction) {
    console.warn("⚠️  Warning:", warning.name);
    console.warn("   Message:", warning.message);
  }
});

// =====================================================
// START THE SERVER
// =====================================================
startServer();