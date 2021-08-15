var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var Transaction = require("../models/transaction");
var Account = require("../models/account");
const { v4: uuidv4 } = require("uuid");
const authenticate = require("../authenticate");
router.use(bodyParser.json());

router.post("/create/transfer", authenticate.verifyUser, (req, res, next) => {
  var transactionIsValid = true;

  if (!req.body.fromAccountNumber) {
    transactionIsValid = false;
    var err = new Error(
      "fromAccountNumber is required to create a new transfer"
    );
    err.status = 500;
    next(err);
  }

  if (!req.body.toAccountNumber) {
    transactionIsValid = false;
    var err = new Error("toAccountNumber is required to create a new transfer");
    err.status = 500;
    next(err);
  }

  if (!req.body.amount) {
    transactionIsValid = false;
    var err = new Error("amount is required to create a new transfer");
    err.status = 500;
    next(err);
  }

  if (!req.user.bankEmployee) {
    Account.find({
      accountNumber: req.body.fromAccountNumber,
      accountOwner: req.user._id,
    })
      .then(
        (account) => {
          if (account[0] === undefined) {
            transactionIsValid = false;
            var err = new Error(
              "You cannot transfer funds from an account that does not belong to you"
            );
            err.status = 500;
            next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }

  Account.find({ accountNumber: req.body.fromAccountNumber })
    .then(
      (account) => {
        if (account[0] === undefined) {
          transactionIsValid = false;
          var err = new Error("fromAccountNumber does not exist");
          err.status = 500;
          next(err);
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));

  Account.find({ accountNumber: req.body.toAccountNumber })
    .then(
      (account) => {
        if (account[0] === undefined) {
          transactionIsValid = false;
          var err = new Error("toAccountNumber does not exist");
          err.status = 500;
          next(err);
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));

  if (req.body.fromAccountNumber === req.body.toAccountNumber) {
    transactionIsValid = false;
    var err = new Error(
      "fromAccountNumber and toAccountNumber cannot be the same"
    );
    err.status = 500;
    next(err);
  }

  if (transactionIsValid === true) {
    Account.findOne({
      accountNumber: req.body.fromAccountNumber,
    }).then((account) => {
      var newAccountBalance = account.accountBalance - req.body.amount * 100;
      Account.findByIdAndUpdate(
        account._id,
        { $set: { accountBalance: newAccountBalance } },
        { new: true }
      )
        .then(
          (account) => {
            console.log(account);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    });

    Account.findOne({
      accountNumber: req.body.toAccountNumber,
    }).then((account) => {
      var newAccountBalance = account.accountBalance + req.body.amount * 100;
      Account.findByIdAndUpdate(
        account._id,
        { $set: { accountBalance: newAccountBalance } },
        { new: true }
      )
        .then(
          (account) => {
            console.log(account);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    });

    Transaction.create({
      fromAccountNumber: req.body.fromAccountNumber,
      toAccountNumber: req.body.toAccountNumber,
      transactionId: uuidv4(),
      amount: req.body.amount,
      type: "transfer",
    })
      .then(
        (transaction) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(transaction);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  } else {
    var err = new Error("Unable to create transaction");
    err.status = 500;
    next(err);
  }
});

router.post(
  "/create/withdrawal",
  authenticate.verifyUser,
  authenticate.verifyEmployeeUser,
  (req, res, next) => {
    var transactionIsValid = true;

    if (!req.body.fromAccountNumber) {
      transactionIsValid = false;
      var err = new Error(
        "fromAccountNumber is required to create a new withdrawal"
      );
      err.status = 500;
      next(err);
    }

    if (!req.body.amount) {
      transactionIsValid = false;
      var err = new Error("amount is required to create a new withdrawal");
      err.status = 500;
      next(err);
    }

    if (req.body.amount >= 0) {
      transactionIsValid = false;
      var err = new Error("amount must be negative for a withdrawal");
      err.status = 500;
      next(err);
    }

    Account.find({ accountNumber: req.body.fromAccountNumber })
      .then(
        (account) => {
          if (account[0] === undefined) {
            transactionIsValid = false;
            var err = new Error("fromAccountNumber does not exist");
            err.status = 500;
            next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));

    if (transactionIsValid === true) {
      Account.findOne({
        accountNumber: req.body.fromAccountNumber,
      }).then((account) => {
        var newAccountBalance = account.accountBalance + req.body.amount * 100;
        Account.findByIdAndUpdate(
          account._id,
          { $set: { accountBalance: newAccountBalance } },
          { new: true }
        )
          .then(
            (account) => {
              console.log(account);
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      });

      Transaction.create({
        fromAccountNumber: req.body.fromAccountNumber,
        transactionId: uuidv4(),
        amount: req.body.amount,
        type: "withdrawal",
      })
        .then(
          (transaction) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(transaction);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    } else {
      var err = new Error("Unable to create transaction");
      err.status = 500;
      next(err);
    }
  }
);

router.post(
  "/create/deposit",
  authenticate.verifyUser,
  authenticate.verifyEmployeeUser,
  (req, res, next) => {
    console.log(req.user);

    var transactionIsValid = true;

    if (!req.body.toAccountNumber) {
      transactionIsValid = false;
      var err = new Error(
        "toAccountNumber is required to create a new deposit"
      );
      err.status = 500;
      next(err);
    }

    if (!req.body.amount) {
      transactionIsValid = false;
      var err = new Error("amount is required to create a new deposit");
      err.status = 500;
      next(err);
    }

    if (req.body.amount <= 0) {
      transactionIsValid = false;
      var err = new Error("amount must be positive for a deposit");
      err.status = 500;
      next(err);
    }

    Account.find({ accountNumber: req.body.toAccountNumber })
      .then(
        (account) => {
          if (account[0] === undefined) {
            transactionIsValid = false;
            var err = new Error("toAccountNumber does not exist");
            err.status = 500;
            next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));

    if (transactionIsValid === true) {
      Account.findOne({
        accountNumber: req.body.toAccountNumber,
      }).then((account) => {
        var newAccountBalance = account.accountBalance + req.body.amount * 100;
        Account.findByIdAndUpdate(
          account._id,
          { $set: { accountBalance: newAccountBalance } },
          { new: true }
        )
          .then(
            (account) => {
              console.log(account);
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      });

      Transaction.create({
        toAccountNumber: req.body.toAccountNumber,
        transactionId: uuidv4(),
        amount: req.body.amount,
        type: "deposit",
      })
        .then(
          (transaction) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(transaction);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    } else {
      var err = new Error("Unable to create transaction");
      err.status = 500;
      next(err);
    }
  }
);

router.get(
  "/list/:accountNumber",
  authenticate.verifyUser,
  (req, res, next) => {
    if (!req.user.bankEmployee) {
      Account.find({
        accountNumber: req.body.accountNumber,
        accountOwner: req.user._id,
      })
        .then(
          (account) => {
            if (account[0] === undefined) {
              var err = new Error(
                "You cannot view transactions from an account that does not belong to you"
              );
              err.status = 500;
              next(err);
            } else {
              Transaction.find({ fromAccountNumber: req.params.accountNumber })
                .then(
                  (transactions) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(transactions);
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    } else {
      Transaction.find({ fromAccountNumber: req.params.accountNumber })
        .then(
          (transactions) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(transactions);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  }
);

module.exports = router;
