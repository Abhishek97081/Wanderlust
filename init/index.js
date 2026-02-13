const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../Models/listing.js");

const Mongo_URL = "mongodb://127.0.0.1:27017/Wanderlust";

async function main() {
    await mongoose.connect(Mongo_URL);
}

main()
    .then(async () => {
        console.log("Connected to DB");
        await initDB();
    })
    .catch(err => console.log(err));

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("Data was initialized");
};
