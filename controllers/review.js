
const Listing = require("../Models/listing.js");
const Review = require("../Models/review.js");

module.exports.createReview=async (req, res) => {
    const { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError("Listing not found", 404);
    }

    let newReview = new Review(req.body.review);
newReview.author = req.user._id;
    await newReview.save();

    listing.reviews.push(newReview._id);
    await listing.save();

    req.flash("success", "Successfully created a new review!");
    res.redirect(`/listings/${listing._id}`);
  };
  module.exports.deleteReview=async (req, res) => {
      const { id, reviewId } = req.params;
  
      await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
      });
  
      await Review.findByIdAndDelete(reviewId);
  
      req.flash("success", "Successfully deleted the review!");
      res.redirect(`/listings/${id}`);
    };