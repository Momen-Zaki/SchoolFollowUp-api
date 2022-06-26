const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

mongoose.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DB_NAME,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("connected to followup database");
});
