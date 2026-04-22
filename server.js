const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

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

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    // 1. Create software module
    const moduleRes = await axios.post(
      `${HAWKBIT_URL}/softwaremodules`,
      [{
        name: req.file.originalname,
        version: "1.0.0",
        type: "os"
      }],
      { auth: AUTH }
    );

    const moduleId = moduleRes.data[0].id;

    // 2. Upload artifact to module
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));

    await axios.post(
      `${HAWKBIT_URL}/softwaremodules/${moduleId}/artifacts`,
      form,
      {
        auth: AUTH,
        headers: form.getHeaders()
      }
    );

    res.json({ success: true, moduleId });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send(err.response?.data || err.message);
  }
});

app.post("/api/distribution", async (req, res) => {
  try {
    const response = await axios.post(
      `${HAWKBIT_URL}/distributionsets`,
      {
        name: req.body.name,
        modules: [
          {
            id: req.body.moduleId
          }
        ]
      },
      { auth: AUTH }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/rollout", async (req, res) => {
  try {
    const response = await axios.post(
      `${HAWKBIT_URL}/deployment`,
      {
        targetFilterQuery: `controllerId==${req.body.targetId}`,
        distributionSetId: req.body.distributionId
      },
      { auth: AUTH }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

