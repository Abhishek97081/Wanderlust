const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
require("dotenv").config();

const mapToken = process.env.Map_Token;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const ownerId = "69d179668e3dd896d25c9fd2";

  const listingsWithGeometry = await Promise.all(
    initData.data.map(async (listing) => {
      const response = await geocodingClient
        .forwardGeocode({
          query: `${listing.location}, ${listing.country}`,
          limit: 1,
        })
        .send();

      return {
        ...listing,
        owner: ownerId,
        category: listing.category || "Other",
        geometry: response.body.features[0].geometry,
      };
    })
  );

  await Listing.insertMany(listingsWithGeometry);
  console.log("Data initialized with geometry and owner!");
};

initDB();