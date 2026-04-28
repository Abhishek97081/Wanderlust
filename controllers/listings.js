const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// ✅ Correct env variable (MUST be uppercase in .env)
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


// ================= INDEX =================
module.exports.index = async (req, res) => {
  const { category } = req.query;

  let allListings;

  if (category && category !== "Other") {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index.ejs", { allListings, category });
};


// ================= SEARCH =================
module.exports.searchListings = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.redirect("/listings");
  }

  const searchText = q.trim();

  let allListings = await Listing.find({
    $or: [
      { title: { $regex: searchText, $options: "i" } },
      { location: { $regex: searchText, $options: "i" } },
      { country: { $regex: searchText, $options: "i" } },
    ],
  });

  if (allListings.length === 0) {
    allListings = await Listing.aggregate([{ $sample: { size: 9 } }]);
  }

  res.render("listings/index.ejs", { allListings, category: null });
};


// ================= NEW FORM =================
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};


// ================= SHOW LISTING (MAP FIX HERE) =================
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // ✅ PASS mapToken TO EJS (IMPORTANT)
  res.render("listings/show.ejs", {
    listing,
    mapToken,
  });
};


// ================= CREATE LISTING =================
module.exports.createListing = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  // ✅ SAFE geometry assignment
  if (response.body.features.length) {
    newListing.geometry = response.body.features[0].geometry;
  }

  await newListing.save();

  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listings");
};


// ================= EDIT FORM =================
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
};


// ================= UPDATE LISTING =================
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const updatedListing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true, runValidators: true }
  );

  if (!updatedListing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (req.file) {
    updatedListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  if (req.body.listing.location) {
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    if (response.body.features.length) {
      updatedListing.geometry = response.body.features[0].geometry;
    }
  }

  await updatedListing.save();

  req.flash("success", "Successfully updated the listing!");
  res.redirect(`/listings/${id}`);
};


// ================= DELETE =================
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  req.flash("success", "Successfully deleted the listing!");
  res.redirect("/listings");
};