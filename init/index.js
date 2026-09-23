const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../Models/Listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
require("dotenv").config({ path: "../.env" });

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

main()
    .then(res => console.log("Database Working"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    const listingsWithGeometry = await Promise.all(
        initData.data.map(async (obj) => {
            const response = await geocodingClient
                .forwardGeocode({
                    query: obj.location,
                    limit: 1
                })
                .send();

            return {
                ...obj,
                owner: "6a9fda16dbb3d38746285c30",
                geometry: response.body.features[0].geometry
            };
        })
    );

    await Listing.insertMany(listingsWithGeometry);

    console.log("Data was initialized!");
};

initDB();