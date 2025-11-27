"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const winston_1 = require("winston");
const path = require("path");
const fs = require("fs");
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
exports.log = (0, winston_1.createLogger)({
    level: "info",
    format: winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({ filename: path.join(logDir, "backend.log") })
    ]
});
