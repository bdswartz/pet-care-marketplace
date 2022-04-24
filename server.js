require("dotenv").config();
// make express available to the app (aka instantiates express)
const express = require("express");
// assigns express to the variable app
const app = express();
const PORT = process.env.PORT || 3001;
// Node module that allows you to extract module.exports object
const path = require("path");
// define the routing
const routes = require("./controllers");
// tell sequelize where the connection is located
const sequelize = require("./config/connection");
const session = require("express-session");

var Handlebars = require("handlebars");
var MomentHandler = require("handlebars.moment");
MomentHandler.registerHelpers(Handlebars);

// define path to helpers
const helpers = require("./utils/helpers");

// set up handlebars as the template engine
const exphbs = require("express-handlebars");
const hbs = exphbs.create({ helpers });

// set extension in views files to handlebars so engine recognizes handlebars files
// ie tells handlebars layout file to render
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");


// connect to npm module connect-session-sequelize and pass through express sessionStore property
const SequelizeStore = require("connect-session-sequelize")(session.Store);

app.use(
  session({
    name: "sid",
    resave: false,
    saveUninitialized: false,
    secret: "cookiemonsta",
    store: new SequelizeStore({
      db: sequelize,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
      sameSite: true,
    },
  })
);

// Middleware to parse information for the db
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// use the path node and express middleware to serve static resources in public folder
app.use(express.static(path.join(__dirname, "public")));

// turn on routes
app.use(routes);

// turn on connection to db and server
sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () => console.log("Now listening"));
});
