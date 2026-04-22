const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const HAWKBIT_URL = "http://hawkbit:8080/rest/v1";
const AUTH = {
  username: "admin",
  password: "admin"
};

// Get all targets
app.get("/api/targets", async (req, res) => {
  try {
    const response = await axios.get(`${HAWKBIT_URL}/targets`, {
      auth: AUTH
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create target
app.post("/api/targets", async (req, res) => {
  try {
    const response = await axios.post(
      `${HAWKBIT_URL}/targets`,
      [req.body],
      { auth: AUTH }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log("UI running on port 3000");
});