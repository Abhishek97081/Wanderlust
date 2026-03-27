const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./Models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./Models/review.js");

app.engine("ejs", ejsMate);

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

// Static files
app.use(express.static(path.join(__dirname, "/public")));

// DB connection
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Root
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

// ================= ROUTES =================

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  } else {
    next();
  }
};

// Index
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// New
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
}));

// Create
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// Edit
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

// Update
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true, runValidators: true }
  );

  res.redirect(`/listings/${id}`);
}));

// Delete
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

//================Review Routes=================

// Post Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  console.log("new review saved");
  res.redirect(`/listings/${listing._id}`);
}));

// ================= Delete Review =================
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));  

// ================= ERROR HANDLING =================

// 404 handler
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error middleware
app.use((err, req, res, next) => {
  let { message = "Something went wrong", statusCode = 500 } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Server
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});