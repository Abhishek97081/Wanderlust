const Listing = require("../Models/listing.js");
module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  };

  module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
  };

  module.exports.showListing=async (req, res) => {
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
    module.exports.createListing=async (req, res) => {
      let url=req.file.path;
      let filename=req.file.filename;
       console.log(url, " ",filename);
        const newListing = new Listing(req.body.listing);
    
        newListing.owner = req.user._id;
    
        if (!newListing.image) {
          newListing.image = {};
        }
    
        if (!newListing.image.url || newListing.image.url.trim() === "") {
          newListing.image.url = undefined;
        }
    newListing.image.url=url;
    newListing.image.filename=filename;
        await newListing.save();
    
        req.flash("success", "Successfully created a new listing!");
        res.redirect("/listings");
      };
      module.exports.renderEditForm=async (req, res) => {
          const { id } = req.params;
          const listing = await Listing.findById(id);
      
          if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
          }
      
          res.render("listings/edit.ejs", { listing });
        };
        module.exports.updateListing=async (req, res) => {
            const { id } = req.params;
        
            const updatedListing = await Listing.findByIdAndUpdate(
              id,
              { ...req.body.listing },
              { new: true, runValidators: true }
            );
            if (req.file!=="undefined") { 
         let url=req.file.path;
      let filename=req.file.filename;
      updatedListing.image.url=url;
      updatedListing.image.filename=filename;
      await updatedListing.save();}
            if (!updatedListing) {
              req.flash("error", "Listing not found!");
              return res.redirect("/listings");
            }
        
            req.flash("success", "Successfully updated the listing!");
            res.redirect(`/listings/${id}`);
          };
          module.exports.deleteListing=async (req, res) => {
              const { id } = req.params;
          
              const deletedListing = await Listing.findByIdAndDelete(id);
          
              if (!deletedListing) {
                req.flash("error", "Listing not found!");
                return res.redirect("/listings");
              }
          
              req.flash("success", "Successfully deleted the listing!");
              res.redirect("/listings");
          };