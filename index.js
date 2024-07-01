const puppeteer = require("puppeteer");
const axios = require("axios");
const express = require("express");
const cors = require("cors");
require('dotenv').config();
// bench selectors (last element is the coach)
const homeTeamBenchSelector =
    "#tm-main > div:nth-child(9) > div > div > div.large-6.columns.aufstellung-box > div.large-5.columns.small-12.aufstellung-ersatzbank-box.aufstellung-vereinsseite > table > tbody > tr";
const awayTeamBenchSelector =
    "#tm-main > div:nth-child(9) > div > div > div:nth-child(3) > div.large-5.columns.small-12.aufstellung-ersatzbank-box.aufstellung-vereinsseite > table > tbody > tr";

async function scrapeData(url, home) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url);

    const startingPlayers = await getStartingPlayers(page);
    const [homeTeamName, awayTeamName] = await getTeamNames(page);
    const subs = await getSubs(
        page,
        home ? homeTeamBenchSelector : awayTeamBenchSelector
    );
    const homeTeam = startingPlayers.splice(0, 11);
    const awayTeam = startingPlayers.splice(0, 11);
    await browser.close();

    if (home)
        return {
            teamName: homeTeamName,
            startingPlayers: homeTeam,
            subs: subs,
            title: `${homeTeamName} vs ${awayTeamName}`,
        };
    return {
        teamName: awayTeamName,
        startingPlayers: awayTeam,
        subs: subs,
        title: `${homeTeamName} vs ${awayTeamName}`,
    };
}

async function getStartingPlayers(page) {
    const data = await page.evaluate(() => {
        const playerNamesSelector = ".aufstellung-rueckennummer-name"; // 11 home 11 away
        const elements = Array.from(
            document.querySelectorAll(playerNamesSelector)
        );
        return elements.map((element) => element.textContent?.trim());
    });
    return data;
}

async function getTeamNames(page) {
    const data = await page.evaluate(() => {
        const teamNamesSelector = ".sb-vereinslink"; // take the first 2 strings only
        const elements = Array.from(
            document.querySelectorAll(teamNamesSelector)
        );
        return elements.map((element) => element.textContent?.trim());
    });
    return data.splice(0, 2);
}

async function getSubs(page, selector) {
    try {
        const rows = await page.$$eval(selector, (rows) => {
            return rows.map((row) => {
                const cells = row.querySelectorAll("td");
                const results = [];
                for (const cell of cells) {
                    const anchor = cell.querySelector("a");
                    const hasSpanSibling = cell.querySelector("span") !== null;
                    if (anchor && hasSpanSibling) {
                        results.push(anchor.innerText);
                    }
                }
                return results;
            });
        });
        return rows.filter((row) => row.length > 0).map((row) => row[0]);
    } catch (error) {
        console.error("Error:", error);
    }
}

async function exec(url, isHomeTeam) {
    try {
        const data = await scrapeData(url, isHomeTeam);
        console.log("Fetched data" + JSON.stringify(data));
        const params = new URLSearchParams({
            formTitle: data.title,
            players: data.startingPlayers,
            subs: data.subs,
        });

        const response = await axios.get(
            process.env.script_url,
            { params }
        );
        return response.data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}


const app = express();
app.use(cors())
app.use(express.json());

app.post("/createForm", async (req, res) => {
    try {
        const { url, isHomeTeam } = req.body;
        const response = await exec(url, isHomeTeam);
        res.send(response);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});
const port = process.env.PORT || 5678;
app.listen(port, () => {
    console.log("Server is running on port 5678");
});
