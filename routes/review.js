const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");

const Listing = require("../Models/listing.js");
const Review = require("../Models/review.js");

// Review validation middleware
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    return next(new ExpressError(errMsg, 400));
  }

  next();
};

// Create review
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }

    let newReview = new Review(req.body.review);

    await newReview.save();

    listing.reviews.push(newReview._id);
    await listing.save();

    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete review
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;