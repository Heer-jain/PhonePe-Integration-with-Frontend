const app = require("./app");
const connectToDb = require("./config/db");
const scheduleDailyPayments = require("./utils/cronJob");


const PORT = process.env.PORT || 3000;

scheduleDailyPayments();

app.listen(PORT, () => {
  connectToDb();
  console.log(`Server started on port ${PORT}`);
});
