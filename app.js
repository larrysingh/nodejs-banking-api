var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
var passport = require("passport");
var config = require("./config");

var indexRouter = require("./routes/index");
var userRouter = require("./routes/user");
var accountRouter = require("./routes/account");
var transactionRouter = require("./routes/transaction");

const url = config.mongoUrl;
const connectToMongoDb = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connectToMongoDb.then(
  (db) => {
    console.log("Connected correctly to the Mongo DB server");
  },
  (err) => {
    console.log(err);
  }
);

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);
app.use("/api/user", userRouter);
app.use("/api/account", accountRouter);
app.use("/api/transaction", transactionRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
