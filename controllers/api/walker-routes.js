const router = require("express").Router();
const withAuth = require("../../utils/auth");
const { Walker, Job } = require("../../models");
const uniqid = require("uniqid");
const codeLatLong = require("../../utils/codeLatLong");

//  route coming into file is /api/walkers

// GET all walkers
router.get("/", (req, res) => {
  // Access our Walker model and run .findAll() method)
  Walker.findAll({
    attributes: { exclude: ["password"] },
  })
    .then((dbWalkerData) => res.json(dbWalkerData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// lookup the walker ID from the front end to get the user info
router.get("/walkerid", (req, res) => {
  if (req.session.loggedIn) {
    console.log(req.session.user_id);
    return res.json({ walkerId: req.session.user_id });
  } else {
    res.status(404).end();
  }
});


// POST /api/walker (used to create a walker on signup)
router.post("/", async (req, res) => {
  // expects {id: 'xxxxx' first_name: 'xxxx', last_name: 'xxxx', email: 'xxxxxx', password: 'xxxxx'}
  const addString = `${req.body.address}  ${req.body.city}, ${req.body.state}`
  const latLong = await codeLatLong(addString)
  console.log(latLong);
  
  Walker.create({
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
    .then((dbWalkerData) => {
      req.session.save(() => {
        req.session.user_id = dbWalkerData.id;
        req.session.email = dbWalkerData.email;
        req.session.lat = dbWalkerData.lat;
        req.session.long = dbWalkerData.long;
        req.session.loggedIn = true;
        req.session.isWalker = true;
        req.session.isOwner = false;

        res.json(dbWalkerData);
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// POST /api/walkers/login
router.post("/login", (req, res) => {
  Walker.findOne({
    where: {
      email: req.body.email,
    },
  }).then((dbWalkerData) => {
    if (!dbWalkerData) {
      res.status(400).json({ message: "No walker with that email address!" });
      return;
    }

    const validPassword = dbWalkerData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({ message: "Incorrect password!" });
      return;
    }
    req.session.save(() => {
      // declare session variables
      req.session.user_id = dbWalkerData.id;
      req.session.email = dbWalkerData.email;
      // req.session.lat = dbWalkerData.lat;
      // req.session.long = dbWalkerData.long;
      req.session.loggedIn = true;
      req.session.isWalker = true;
      req.session.isOwner = false;

      res.json({ user: dbWalkerData, message: "You are now logged in!" });
    });
  });
});

// POST /api/walkers/logout
router.post("/logout", (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

// PUT /api/walker/ to save a walkers job search radius preference
router.put("/", (req, res) => {
  
  Walker.update({radius: req.body.radius}, {
    individualHooks: true,
    where: {
      id: req.session.user_id,
    },
  })
    .then((dbWalkerData) => {
      if (!dbWalkerData[0]) {
        res.status(404).json({ message: "No walker found with this id" });
        return;
      }
      res.json(dbWalkerData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// DELETE /api/walker/1
router.delete("/:id", (req, res) => {
  Walker.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbWalkerData) => {
      if (!dbWalkerData) {
        res.status(404).json({ message: "No walker found with this id" });
        return;
      }
      res.json(dbWalkerData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
