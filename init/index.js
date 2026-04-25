const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const Mongo_URL = "mongodb://127.0.0.1:27017/Wanderlust";

async function main() {
  await mongoose.connect(Mongo_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: "64b8c9e5f1a4c0d1b2e5f6a7",
  }));

  await Listing.insertMany(initdata.data);
  console.log("Data was initialized");
};

main()
  .then(async () => {
    console.log("Connected to DB");
    await initDB();
  })
  .catch((err) => console.log(err));