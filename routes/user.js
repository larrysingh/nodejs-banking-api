var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
const authenticate = require("../authenticate");

router.use(bodyParser.json());

router.post("/signup", (req, res, next) => {
  User.register(
    new User({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      streetAddressLine1: req.body.streetAddressLine1,
      streetAddressLine2: req.body.streetAddressLine2,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
    }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Registration Successful!" });
          });
        });
      }
    }
  );
});

router.put("/", authenticate.verifyUser, (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: req.body,
    },
    { new: true }
  )
    .then(
      (user) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(user);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

router.put(
  "/:userId",
  authenticate.verifyUser,
  authenticate.verifyEmployeeUser,
  (req, res, next) => {
    User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then(
        (user) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

router.post("/login", passport.authenticate("local"), (req, res) => {
  var token = authenticate.getToken({ _id: req.user.id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({
    success: true,
    authToken: token,
    status:
      "Your are successfully logged in! Use the authToken for subsequent requests as a bearer token",
  });
});

router.get("/", authenticate.verifyUser, (req, res) => {
  User.findById(req.user._id)
    .then(
      (userInfo) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(userInfo);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

router.get(
  "/customer/list",
  authenticate.verifyUser,
  authenticate.verifyEmployeeUser,
  (req, res, next) => {
    User.find({ bankEmployee: false, bankAdmin: false })
      .then(
        (customers) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(customers);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

router.get(
  "/employee/list",
  authenticate.verifyUser,
  authenticate.verifyAdminUser,
  (req, res, next) => {
    User.find({ bankEmployee: true })
      .then(
        (users) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(users);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

router.put(
  "/employee",
  authenticate.verifyUser,
  authenticate.verifyAdminUser,
  (req, res, next) => {
    if (!req.body.userId) {
      var err = new Error("userId is required to set user as employee");
      err.status = 500;
      next(err);
    }
    User.updateOne(
      {
        _id: req.body.userId,
      },
      {
        bankEmployee: true,
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
  "/employee/set-admin",
  authenticate.verifyUser,
  authenticate.verifyAdminUser,
  (req, res, next) => {
    if (!req.body.userId) {
      var err = new Error("userId is required to set user as admin");
      err.status = 500;
      next(err);
    }
    User.updateOne(
      {
        _id: req.body.userId,
      },
      {
        bankEmployee: true,
        bankAdmin: true,
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
  "/employee/remove-admin",
  authenticate.verifyUser,
  authenticate.verifyAdminUser,
  (req, res, next) => {
    if (!req.body.userId) {
      var err = new Error("userId is required to remove user as admin");
      err.status = 500;
      next(err);
    }
    User.updateOne(
      {
        _id: req.body.userId,
      },
      {
        bankAdmin: false,
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
  "/employee/remove",
  authenticate.verifyUser,
  authenticate.verifyAdminUser,
  (req, res, next) => {
    if (!req.body.userId) {
      var err = new Error("userId is required to remove user as employee");
      err.status = 500;
      next(err);
    }
    User.updateOne(
      {
        _id: req.body.userId,
      },
      {
        bankEmployee: false,
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

module.exports = router;
