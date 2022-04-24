const router = require("express").Router();
const sequelize = require("../config/connection");
const withAuth = require("../utils/auth");
const { Job, Pets, Owner } = require("../models");

// gets all the jobs by ID on page load and stores them in the jobs variable to use in handlebars
router.get("/", withAuth, (req, res) => {
  const id = req.session.user_id;

  if (req.session.isWalker) {
    Job.findAll({
      order: [['timeframe', 'ASC']],
      where: {
        walker_id: id,
      },
      include: [
        {
          model: Pets,
          attributes: ["id", "pet_name", "pet_type", "description", "owner_id"],
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
      const jobsClean = dbJobData.map((job) => job.get({ plain: true }));
      let jobs = jobsClean.filter((job) => job.completed == false);

      const completedJobsClean = dbJobData.map((job) =>
        job.get({ plain: true })
      );
      let completedJobs = completedJobsClean.filter(
        (job) => job.completed == true
      );

      Pets.findAll({
        where: {
          owner_id: id,
        },
      }).then((dbPetData) => {
        const ownersPets = dbPetData.map((pets) => pets.get({ plain: true }));
        // console.log(ownersPets);
        res.render("dashboard", {
          jobs,
          ownersPets,
          completedJobs,
          loggedIn: req.session.loggedIn,
          walker_id: req.session.user_id,
          isWalker: req.session.isWalker,
          isOwner: req.session.isOwner,
        });
      });
    });
  }

  if (req.session.isOwner) {
    Job.findAll({
      order: [['timeframe', 'DESC']],
      where: {
        owner_id: id,
        // completed: false,
      },
      include: [
        {
          model: Pets,
          attributes: ["id", "pet_name", "pet_type", "description", "owner_id"],
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
      const jobsClean = dbJobData.map((job) => job.get({ plain: true }));
      let jobs = jobsClean.filter((job) => job.completed == false);

      const completedJobsClean = dbJobData.map((job) =>
        job.get({ plain: true })
      );
      let completedJobs = completedJobsClean.filter(
        (job) => job.completed == true
      );

      Pets.findAll({
        where: {
          owner_id: id,
        },
      }).then((dbPetData) => {
        const ownersPets = dbPetData.map((pets) => pets.get({ plain: true }));
        // console.log(ownersPets);
        res.render("dashboard", {
          jobs,
          ownersPets,
          completedJobs,
          loggedIn: req.session.loggedIn,
          owner_id: req.session.user_id,
          isWalker: req.session.isWalker,
          isOwner: req.session.isOwner,
        });
      });
    });
  }
});

module.exports = router;
