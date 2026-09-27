/**
 * Stock Portfolio Tracker - Backend Server Entry Point
 * MongoDB Mongoose Pure Architecture
 */
const app = require("./backend/app");

const rawPort = process.env.PORT;
const PORT = !isNaN(Number(rawPort)) && Number(rawPort) > 0 ? Number(rawPort) : 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 Stock Portfolio Backend Server running`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🗄️ Database: MongoDB Atlas (Pure Mongoose)`);
    console.log(`========================================`);
  });
}

module.exports = app;
