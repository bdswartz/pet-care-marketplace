const router = require("express").Router();
const { Job, Pets, Owner } = require("../../models");
const withAuth = require("../../utils/auth");
// require the operator form from Sequelize to use operators in queries
const { Op } = require("sequelize");

//  route coming into file is /api/jobs

// get all jobs
// router.post("/", (req, res) => {
//   Job.findAll({
//     order: [["timeframe", "ASC"]],
//     include: [
//       {
//         model: Pets,
//         attributes: ["pet_name", "pet_type", "description", "owner_id"],
//       },
//       {
//         model: Owner,
//         attributes: ["first_name", "last_name"],
//       },
//     ],
//   })
//     .then((dbJobData) => res.json(dbJobData))
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json(err);
//     });
// });

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
// gets user input data from the front end and send back filtered jobs by 
// radius
// router.post("/radius", (req, res) => {
//   if (!req.body) {
//     const walkerLat = 0;
//     const walkerLong = 0;
//     const inputDistance = 12500;
//   }
//   else {
//     const walkerLat = req.body.walker_lat;
//     const walkerLong = req.body.walker_long;
//     const inputDistance = req.body.radius;
//   }
//   Job.findAll({
//     order: [["timeframe", "ASC"]],
//     where: {
//             walker_id: null,
//           },
//     include: [
//       {
//         model: Pets,
//         attributes: ["pet_name", "pet_type", "description", "owner_id"],
//       },
//       {
//         model: Owner,
//         attributes: [
//           "first_name",
//           "last_name", 
//           "is_owner", 
//           "address", 
//           "city",
//           "state",
//           "zip_code",
//           "lat", 
//           "long",
//         ],
//       },
//     ],
//   })
//     .then((dbJobData) => {
//       const jobsAll = dbJobData.map((job) => job.get({ plain: true }));
//       const jobs = jobsAll.filter(function(job) {
//       // take each job array and get lat distance and long distance from owner
//       // to walker data in req.session
//       const deltaLat = job.owner.lat - walkerLat;
//       const deltaLong = job.owner.long - walkerLong;
//       const distance = Math.sqrt(Math.pow(deltaLat,2)+Math.pow(deltaLong,2))*(24901/360);
//       // return if hypotenuse is less than search criteria
//       return (distance <= inputDistance);
//     })
//     console.log(jobs);
//     res.render("jobsearch", {
//       jobs,
//       loggedIn: req.session.loggedIn,
//       owner_id: req.session.user_id,
//       isWalker: req.session.isWalker,
//     });
//   })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json(err);
//     });
// });


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

// // Get only *open* jobs
// router.get("/open", (req, res) => {
//   Job.findAll({
//     order: [["timeframe", "ASC"]],
//     where: {
//       walker_id: null,
//     },
//     include: [
//       {
//         model: Pets,
//         attributes: ["id", "pet_name", "pet_type", "description", "owner_id"],
//       },
//       {
//         model: Owner,
//         attributes: [
//           "first_name",
//           "last_name", 
//           "is_owner", 
//           "address", 
//           "city",
//           "state",
//           "zip_code",
//           "lat", 
//           "long",
//         ],
//       },
//     ],
//   }).then((dbJobData) => {
//       console.log(dbJobData);
//       if (!dbJobData) {
//         res.status(404).json({ message: "No jobs found" });
//         return;
//       }
//       res.json(dbJobData);  
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json(err);
//     });
// });

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
TODO:
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
