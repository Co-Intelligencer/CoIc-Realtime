const express = require("express");
const pino = require("pino");

// More explicit logger configuration
const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l o",
    },
  },
});

const app = express();
require("dotenv").config();

// Add a middleware to log all requests
app.use((req, res, next) => {
  logger.info({ path: req.path }, "Incoming request");
  next();
});

app.use(express.static("public"));

app.get("/get-credentials", (req, res) => {
  logger.info("Credentials requested");
  res.json({
    apiKey: process.env.OPENAI_API_KEY,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
