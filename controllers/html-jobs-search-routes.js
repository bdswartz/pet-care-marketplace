const router = require("express").Router();
const sequelize = require("../config/connection");
const { Job, Pets, Owner, Walker } = require("../models");

// This loads calls all jobs on page load and stores it in the jobs variable to use in handlebars
router.get("/", (req, res) => {
  // default: the job search page will display all jobs on the planet
  let inputDistance = 25000;
  let walkerLat = 0;
  let walkerLong = 0;
  // if the user is a walker looking for jobs, find and define(use) their customized preference
  // for distance from their address
  if (req.session.isWalker) {
  Walker.findOne({
    attributes: { exclude: ["password"] },
    where: {
      id: req.session.user_id,
    },
  })
    .then((dbWalkerData) => {
      if (!dbWalkerData) {
        res.status(404).json({ message: "No walker found with this id" });
        return;
      }
      console.log("*****Walker:", dbWalkerData);
      inputDistance = dbWalkerData.radius;
      walkerLat = dbWalkerData.lat;
      walkerLong = dbWalkerData.long;
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
  }

  Job.findAll({
    order: [['timeframe', 'ASC']],
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
          "long"
        ],
      },
    ],
  }).then((dbJobData) => {
    const jobsAll = dbJobData.map((job) => job.get({ plain: true }));
    const jobs = jobsAll.filter(function(job) {
      // take each job array and get lat distance and long distance from owner and
      // compare to walker data
      const deltaLat = job.owner.lat - walkerLat;
      const deltaLong = job.owner.long - walkerLong;
      const distance = Math.sqrt(Math.pow(deltaLat,2)+Math.pow(deltaLong,2))*(24901/360);
      // return if hypotenuse is less than search criteria
      return (distance <= inputDistance);
    })
    res.render("jobsearch", {
      jobs,
      loggedIn: req.session.loggedIn,
      owner_id: req.session.user_id,
      isWalker: req.session.isWalker,
    });
  });
});

module.exports = router;
