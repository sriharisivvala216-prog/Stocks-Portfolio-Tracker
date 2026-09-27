/**
 * Stock Portfolio Tracker - Backend Server Entry Point
 * MongoDB Mongoose Pure Architecture
 */
const app = require("./backend/app");

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 Stock Portfolio Backend Server running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🗄️ Database: MongoDB Atlas (Pure Mongoose)`);
    console.log(`========================================`);
  });
}

module.exports = app;
