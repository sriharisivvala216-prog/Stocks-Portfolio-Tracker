const app = require("./app");

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 Stocks Portfolio Backend Running`);
    console.log(`📡 Local Server: http://localhost:${PORT}`);
    console.log(`🗄️ Database Engine: MongoDB (Mongoose Only)`);
    console.log(`========================================`);
  });
}

module.exports = app;
