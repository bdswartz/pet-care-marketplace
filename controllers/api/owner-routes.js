const router = require("express").Router();
const uniqid = require("uniqid");
const codeLatLong = require("../../utils/codeLatLong");

// const withAuth = require('../../utils/auth');
const { Owner, Job, Pets } = require("../../models");

//  route coming into file is /api/owner

// GET all owners
router.get("/", (req, res) => {
  Owner.findAll({
    attributes: { exclude: ["password"] },
  })
    .then((dbOwnerData) => res.json(dbOwnerData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// GET one owner and associated jobs and pets
router.get("/:id", (req, res) => {
  Owner.findOne({
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Job,
        attributes: [
          "id",
          "pay",
          "check_in",
          "walk",
          "timeframe",
          "location",
          "completed",
          "owner_id",
          "animal_id",
        ],
      },
      {
        model: Pets,
        attributes: ["id", "pet_name", "pet_type", "description"],
      },
    ],
    where: {
      id: req.params.id,
    },
  })
    .then((dbOwnerData) => {
      if (!dbOwnerData) {
        res.status(404).json({ message: "No user found with this id" });
        return;
      }
      res.json(dbOwnerData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// POST /api/owner (create an owner - used for the signup of new owners)
router.post("/", async (req, res) => {
  // concatenate the address string and send to geocoder function to get Lat and Long
  const addString = `${req.body.address}  ${req.body.city}, ${req.body.state}`
  const latLong = await codeLatLong(addString)
  console.log(latLong);

  Owner.create({
    id: uniqid(),
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    lat: latLong[0].latitude,
    long: latLong[0].longitude,
    zip_code: req.body.zip_code,
  })
    .then((dbOwnerData) => {
      req.session.save(() => {
        req.session.user_id = dbOwnerData.id;
        req.session.email = dbOwnerData.email;
        req.session.loggedIn = true;
        req.session.isWalker = false;
        req.session.isOwner = true;
        res.json(dbOwnerData);
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// POST /api/owner/login
router.post("/login", (req, res) => {
  Owner.findOne({
    where: {
      email: req.body.email,
    },
  }).then((dbOwnerData) => {
    if (!dbOwnerData) {
      res.status(400).json({ message: "No owner with that email address!" });
      return;
    }

    const validPassword = dbOwnerData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({ message: "Incorrect password!" });
      return;
    }
    req.session.save(() => {
      // declare session variables
      req.session.user_id = dbOwnerData.id;
      req.session.email = dbOwnerData.email;
      req.session.loggedIn = true;
      req.session.isOwner = true;
      req.session.isWalker = false;

      res.json({ user: dbOwnerData, message: "You are now logged in!" });
    });
  });
});

// POST /api/owner/logout
router.post("/logout", (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.json({ message: "You are now logged out!" });
      console.log("logged out");
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

// PUT /api/owner/1
router.put("/:id", (req, res) => {
  Owner.update(req.body, {
    individualHooks: true,
    where: {
      id: req.params.id,
    },
  })
    .then((dbOwnerData) => {
      if (!dbOwnerData[0]) {
        res.status(404).json({ message: "No owner found with this id" });
        return;
      }
      res.json(dbOwnerData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// DELETE /api/owner/1
router.delete("/:id", (req, res) => {
  Owner.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbOwnerData) => {
      if (!dbOwnerData) {
        res.status(404).json({ message: "No owner found with this id" });
        return;
      }
      res.json(dbOwnerData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
