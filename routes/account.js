var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var Account = require("../models/account");
const { v4: uuidv4 } = require("uuid");
const authenticate = require("../authenticate");
router.use(bodyParser.json());

router.post("/create", authenticate.verifyUser, (req, res, next) => {
  req.body.accountNumber = uuidv4();
  req.body.accountOwner = req.user._id;
  Account.create(req.body)
    .then(
      (account) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(account);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

router.put(
  "/close/:accountNumber",
  authenticate.verifyUser,
  authenticate.verifyAdminUser,
  (req, res, next) => {
    if (!req.params.accountNumber) {
      var err = new Error("accountNumber is required to close account");
      err.status = 500;
      next(err);
    }

    Account.find({ accountNumber: req.params.accountNumber })
      .then(
        (account) => {
          if (account[0].accountBalance !== 0) {
            var err = new Error(
              "accountBalance must be $0.00 to close account"
            );
            err.status = 500;
            next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));

    Account.updateOne(
      {
        accountNumber: req.params.accountNumber,
      },
      {
        activeStatus: false,
      }
    )
      .then(
        (userInfo) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(userInfo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

router.put(
  "/reopen/:accountNumber",
  authenticate.verifyUser,
  authenticate.verifyAdminUser,
  (req, res, next) => {
    if (!req.params.accountNumber) {
      var err = new Error("accountNumber is required to close account");
      err.status = 500;
      next(err);
    }

    Account.updateOne(
      {
        accountNumber: req.params.accountNumber,
      },
      {
        activeStatus: true,
      }
    )
      .then(
        (userInfo) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(userInfo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

router.get("/list", authenticate.verifyUser, (req, res, next) => {
  Account.find({ accountOwner: req.user._id })
    .then(
      (accounts) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(accounts);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

router.get(
  "/list/all",
  authenticate.verifyUser,
  authenticate.verifyEmployeeUser,
  (req, res, next) => {
    Account.find()
      .then(
        (accounts) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(accounts);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

router.get(
  "/search/:accountNumber",
  authenticate.verifyUser,
  authenticate.verifyEmployeeUser,
  (req, res, next) => {
    Account.find({ accountNumber: req.params.accountNumber })
      .then(
        (account) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(account);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

module.exports = router;
