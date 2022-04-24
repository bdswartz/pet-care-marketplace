const router = require("express").Router();
const { Job, Pets, Owner } = require("../../models");
const withAuth = require("../../utils/auth");
// require the operator form from Sequelize to use operators in queries
const { Op } = require("sequelize");

//  route coming into file is /api/jobs


// sends open jobs to the caller
router.get("/open", (req, res) => {
  Job.findAll({
    order: [["timeframe", "ASC"]],
    where: {
            walker_id: null,
          },
    include: [
      {
        model: Pets,
        attributes: ["pet_name", "pet_type", "description", "owner_id"],
      },
      {
        model: Owner,
        attributes: [
          "first_name",
          "last_name", 
          "is_owner", 
          "address", 
          "city",
          "state",
          "zip_code",
          "lat", 
          "long",
        ],
      },
    ],
  })
    .then((dbJobData) => res.json(dbJobData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Get one Job by ID
router.get("/:id", (req, res) => {
  Job.findOne({
    where: {
      id: req.params.id,
    },
    include: [
      {
        model: Pets,
        attributes: ["id", "pet_name", "pet_type", "description", "owner_id"],
      },
      {
        model: Owner,
        attributes: ["first_name", "last_name"],
      },
    ],
  })
    .then((dbJobData) => {
      if (!dbJobData) {
        res.status(404).json({ message: "No job found with this id" });
        return;
      }
      res.json(dbJobData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});


// Get jobs by owner
router.post("/owner", (req, res) => {
  Job.findAll({
    order: [["timeframe", "DESC"]],
    where: {
      owner_id: req.body.owner_id,
    },
    include: [
      {
        model: Pets,
        attributes: ["id", "pet_name", "pet_type", "description", "owner_id"],
      },
      {
        model: Owner,
        attributes: ["first_name", "last_name"],
      },
    ],
  })
    .then((dbJobData) => {
      if (!dbJobData) {
        res.status(404).json({ message: "No job found with this id" });
        return;
      }
      res.json(dbJobData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Get jobs by walker
router.post("/walker", (req, res) => {
  // expected body {walker_id: {public key from Hiro}}
  Job.findAll({
    order: [["timeframe", "ASC"]],
    where: {
      walker_id: req.body.walker_id,
    },
    include: [
      {
        model: Pets,
        attributes: ["id", "pet_name", "pet_type", "description", "owner_id"],
      },
      {
        model: Owner,
        attributes: ["first_name", "last_name"],
      },
    ],
  })
    .then((dbJobData) => {
      if (!dbJobData) {
        res.status(404).json({ message: "No job found with this walker_id" });
        return;
      }
      res.json(dbJobData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});
// Create a new job (ie owner completes job order form)
router.post("/", (req, res) => {
  const id = req.session.user_id;
  Job.create({
    pay: req.body.pay,
    check_in: req.body.check_in,
    food_and_water: req.body.food_and_water,
    walk: req.body.walk,
    treat: req.body.treat,
    litter_box: req.body.litter_box,
    timeframe: req.body.timeframe,
    location: req.body.location,
    completed: false,
    owner_id: id,
    walker_id: null,
    animal_id: req.body.animal_id,
  })
    .then((dbJobData) => res.json(dbJobData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Update a job with the walker's id to "accept" the job
router.put("/accept/:id", (req, res) => {
  // expects { walker_id: 'Walker ID String'} to accept the job
  // expects { walker_id: null } to remove walker's acceptance
  Job.update(
    {
      walker_id: req.body.walker_id,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((dbJobData) => {
      if (!dbJobData) {
        res.status(404).json({ message: "No job found with this id" });
        return;
      }
      res.json(dbJobData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Complete (or reopen) a job
router.put("/complete/:id", (req, res) => {
  // expects { completed: true } to complete the job
  // expects { completed: false } to remove walker's acceptance
  Job.update(
    {
      completed: req.body.completed,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((dbJobData) => {
      if (!dbJobData) {
        res.status(404).json({ message: "No job found with this id" });
        return;
      }
      res.json(dbJobData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

//  Delete a job
router.delete("/:id", (req, res) => {
  Job.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbJobData) => {
      if (!dbJobData) {
        res.status(404).json({ message: "No job found with this id" });
        return;
      }
      res.json(dbJobData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
