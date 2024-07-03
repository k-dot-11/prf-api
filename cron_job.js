const { default: axios } = require("axios");
const cron = require("cron");

const url = process.env.selfCheck || "http://localhost:5000";

//cron for every 10 seconds
const job = new cron.CronJob("*/14 * * * *", function () {
    axios
        .get(url, {
            headers: {
                authorization: process.env.ping_token,
            },
        })
        .then((res) => {
            if (res.status == 200) {
                console.log(res.data);
            }
        })
        .catch((err) => {
            console.log(err.message);
        });
});

module.exports = { job };
