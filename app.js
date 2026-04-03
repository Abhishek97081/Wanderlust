const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError.js");
const listingsRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/review.js");

app.engine("ejs", ejsMate);

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

// Static files
app.use(express.static(path.join(__dirname, "/public")));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Method override
app.use(methodOverride("_method"));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// DB connection
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  console.log(res.locals.success);
  res.locals.error = req.flash("error");
  next();
}); // ✅ FIXED

// Root route
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// Listing routes
app.use("/listings", listingsRoutes);

// Review routes
app.use("/listings/:id/reviews", reviewsRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error handler
app.use((err, req, res, next) => {
  let { message = "Something went wrong", statusCode = 500 } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Server
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});