import "./env.js";
import { createLogger, format, transports } from "winston";
const { combine, printf, colorize } = format;

const LOG_LEVEL = process.env.LOG_LEVEL || "debug";

// Custom format to handle additional context like module names
const customFormat = printf(({ level, message, moduleName }) => {
  const moduleInfo = moduleName ? `\x1b[94m[${moduleName}]\x1b[0m` : ""; // Add module name if provided
  return `${level}: ${moduleInfo} ${message}`;
});

// Create the logger
const logger = createLogger({
  level: LOG_LEVEL,
  format: combine(
    colorize(), // Add color to the console output
    customFormat // Use the custom format
  ),
  transports: [
    new transports.Console(), // Log to console
  ],
});

// Extend the logger's debug method to accept additional parameters like module name
const originalDebug = logger.debug.bind(logger);
logger.debug = (message, moduleName) => {
  originalDebug({ message, moduleName });
};

export default logger;
