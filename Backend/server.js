require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectToDB = require("./config/db");

const PORT = process.env.PORT || 4001;

connectToDB()
  .then(() => {
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.clear();

      console.log("\n============================================");
      console.log("🚀 JUMLAYA Backend Server is Live");
      console.log("============================================");
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}`);
      console.log("============================================\n");
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });
