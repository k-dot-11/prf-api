const axios = require("axios");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const scrapeData = require("./scraper");
const firebaseUtils = require("./firebase_middleware");
const { cacheResponse, getCachedResponse } = require("./cache_utils");

require("dotenv").config();

async function exec(url, isHomeTeam, userEmail) {
    try {
        const cachedResponse = getCachedResponse(url, isHomeTeam);
        let data = {};
        if (cachedResponse) {
            data = cachedResponse;
        } else {
            data = await scrapeData(url, isHomeTeam);
            cacheResponse(url, isHomeTeam, data);
        }

        const params = new URLSearchParams({
            formTitle: data.title,
            players: data.startingPlayers,
            subs: data.subs,
            email: userEmail,
        });

        const response = await axios.get(process.env.script_url, { params });
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

const app = express();
app.use(cors());
app.use(express.json());

app.post("/createForm", firebaseUtils.checkFirebaseToken, async (req, res) => {
    console.time("Request");
    try {
        const { url, isHomeTeam, userEmail } = req.body;
        const response = await exec(url, isHomeTeam, userEmail);
        res.send(response);
        firebaseUtils.updateRequestCount(req);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    } finally {
        console.timeEnd("Request"); // End timing and log the result
    }
});

// Cache Metrics
// Request: 21.494s
// Request: 13.409s

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log("Server is running on port 8000");
});

process.on("SIGINT", () => {
    console.log("Received SIGINT. Gracefully shutting down.");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});
