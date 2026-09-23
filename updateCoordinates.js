require("dotenv").config();

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Listing = require("./models/listing");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function updateCoordinates() {
    await mongoose.connect(MONGO_URL);

    const listings = await Listing.find({
        geometry: { $exists: false }
    });

    for (let listing of listings) {
        const response = await geocodingClient.forwardGeocode({
            query: listing.location,
            limit: 1
        }).send();

        if (response.body.features.length > 0) {
            listing.geometry = response.body.features[0].geometry;
            await listing.save();
            console.log("Updated:", listing.title);
        }
    }

    await mongoose.connection.close();
    console.log("Done!");
}

updateCoordinates();