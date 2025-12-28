import NocoDB from "./modules/nocodb.js";
import { sendNotification } from "./modules/discord.js";
import logger from "./modules/logger.js";
import moment from "moment";
import cron from "node-cron";

// disable TLS verification, for self-signed certificates, nocodb might be running with self-signed cert
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Configuration
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;
const NOCODB_URL = process.env.NOCODB_URL;
const NOCODB_API_KEY = process.env.NOCODB_API_KEY;
const NOCODB_TABLE_ID = process.env.NOCODB_TABLE_ID;
const CRON_INTERVAL = process.env.CRON_INTERVAL;
const RUN_STARTUP = !!process.env.RUN_STARTUP;

// nocodb instance
const nocodb = new NocoDB(NOCODB_URL, NOCODB_API_KEY);

async function run() {
  try {
    const today = moment().format("DD.MM");
    const todayFull = moment().format("YYYY-MM-DD");
    logger.debug("Making request to NocoDB to get all birthdays...");
    const rows = await nocodb.listRows(NOCODB_TABLE_ID, {
      limit: 1000,
    });
    // go through all rows and check if today is someone's birthday
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row["Date"] === today) {
        logger.info(`It's ${row["Name"]}'s birthday today!`);
        await sendNotification(
          DISCORD_WEBHOOK,
          `🎉 Today is ${row["Name"]}'s birthday!`
        );
        await nocodb.updateRow(NOCODB_TABLE_ID, row["Id"], {
          SentNotifications: (row["SentNotifications"] || 0) + 1,
          LastNotification: todayFull,
        });
      }
    }
  } catch (err) {
    logger.error("Error occurred during birthday check:", err);
  }
}

async function main() {
  logger.info("Birthday notification (nocodb) script started");
  cron.schedule(CRON_INTERVAL, async () => {
    logger.debug("Running scheduled birthday check...");
    await run();
  });

  if (RUN_STARTUP) {
    await run();
  }
}

main();
