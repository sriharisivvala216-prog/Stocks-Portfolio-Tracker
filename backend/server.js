const app = require("./app");

const rawPort = process.env.PORT;
const PORT = !isNaN(Number(rawPort)) && Number(rawPort) > 0 ? Number(rawPort) : 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 Stocks Portfolio Backend Running`);
    console.log(`📡 Local Port: ${PORT}`);
    console.log(`🗄️ Database Engine: MongoDB (Mongoose Only)`);
    console.log(`========================================`);
  });
}

module.exports = app;
