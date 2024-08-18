const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI + process.env.DB_NAME)
  .then(() => {
    console.log("mongoosedb connect");
  })
  .catch((err) => {
    console.log("err", err.message);
  });
