var express = require("express");
var router = express.Router();
var moment = require("moment");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({
    status: "API is running",
    ready: true,
    currentDateTime: moment().format(),
  });
});

module.exports = router;
