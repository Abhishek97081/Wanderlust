const Listing = require("../Models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.Map_Token;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

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

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

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
    let url = req.file.path;
    let filename = req.file.filename;

    newListing.image = {
      url,
      filename,
    };
  }

  newListing.geometry = response.body.features[0].geometry;

  await newListing.save();

  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
};

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
    let url = req.file.path;
    let filename = req.file.filename;

    updatedListing.image = {
      url,
      filename,
    };

    await updatedListing.save();
  }

  if (req.body.listing.location) {
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    updatedListing.geometry = response.body.features[0].geometry;
    await updatedListing.save();
  }

  req.flash("success", "Successfully updated the listing!");
  res.redirect(`/listings/${id}`);
};

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