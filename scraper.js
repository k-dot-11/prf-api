const cheerio = require("cheerio");
const rp = require("request-promise");

const homeTeamBenchSelector =
    "#tm-main > div:nth-child(9) > div > div > div.large-6.columns.aufstellung-box > div.large-5.columns.small-12.aufstellung-ersatzbank-box.aufstellung-vereinsseite > table > tbody > tr";
const awayTeamBenchSelector =
    "#tm-main > div:nth-child(9) > div > div > div:nth-child(3) > div.large-5.columns.small-12.aufstellung-ersatzbank-box.aufstellung-vereinsseite > table > tbody > tr";
const homeTeamStartingPlayersSelector =
    "#tm-main > div:nth-child(8) > div:nth-child(1) > div > div.responsive-table > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a";
const awayTeamStartingPlayersSelector =
    "#tm-main > div:nth-child(8) > div:nth-child(2) > div > div.responsive-table > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a";

async function scrapeData(url, home) {
    const html = await rp(url);
    const $ = cheerio.load(html);

    const [homeTeamName, awayTeamName] = getTeamNames($);
    const matchNumber = url.split("/").pop();
    const startingPlayersSelector = home
        ? homeTeamStartingPlayersSelector
        : awayTeamStartingPlayersSelector;
    const startingPlayers = await getStartingPlayers(
        homeTeamName,
        awayTeamName,
        startingPlayersSelector,
        matchNumber
    );

    const subs = getSubs(
        $,
        home ? homeTeamBenchSelector : awayTeamBenchSelector
    );
    console.log(
        `Home Team: ${homeTeamName}\nAway Team: ${awayTeamName}\nStarting Players: ${startingPlayers}\nSubs: ${subs}`
    );
    if (home)
        return {
            teamName: homeTeamName,
            startingPlayers: startingPlayers,
            subs: subs,
            title: `${homeTeamName} vs ${awayTeamName}`,
        };
    return {
        teamName: awayTeamName,
        startingPlayers: startingPlayers,
        subs: subs,
        title: `${homeTeamName} vs ${awayTeamName}`,
    };
}

// document.querySelectorAll("#tm-main > div:nth-child(8) > div:nth-child(1) > div > div.responsive-table > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > a").forEach((item) => console.log(item.innerText))
async function getStartingPlayers(
    homeTeamName,
    awayTeamName,
    selector,
    matchNumber
) {
    const url = `https://www.transfermarkt.com/${homeTeamName}_${awayTeamName}/aufstellung/spielbericht/${matchNumber}`;
    const html = await rp(url);
    const $ = cheerio.load(html);
    const elements = $(selector);
    const data = [];
    elements.each((_, element) => {
        data.push($(element).text().trim());
    });
    return data;
}

function getTeamNames($) {
    const teamNamesSelector = ".sb-vereinslink";
    const elements = $(teamNamesSelector);
    const data = [];
    elements.each((index, element) => {
        if (index < 2) {
            // Only take the first two names
            data.push($(element).text().trim());
        }
    });
    return data;
}

function getSubs($, selector) {
    const rows = $(selector);
    const subs = [];
    rows.each((_, row) => {
        const cells = $(row).find("td");
        cells.each((_, cell) => {
            const anchor = $(cell).find("a");
            const hasSpanSibling = $(cell).find("span").length > 0;
            if (anchor.length && hasSpanSibling) {
                subs.push(anchor.text().trim());
            }
        });
    });
    return subs.filter((sub) => sub.length > 0);
}

module.exports = scrapeData;
