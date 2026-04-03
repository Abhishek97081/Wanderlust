const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../Models/listing.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  } else {
    next();
  }
};

// Index Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// New Route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
    req.flash("error", "Listing not found!");
    res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  })
);

// Create Route
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
  })
);

// Edit Route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }

    res.render("listings/edit.ejs", { listing });
  })
);

// Update Route
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      throw new ExpressError("Listing not found", 404);
    }
 req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      throw new ExpressError("Listing not found", 404);
    }
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
  })
);

module.exports = router;