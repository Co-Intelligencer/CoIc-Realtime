const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.static("public"));

app.get("/get-credentials", (req, res) => {
  res.json({
    apiKey: process.env.OPENAI_API_KEY,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
