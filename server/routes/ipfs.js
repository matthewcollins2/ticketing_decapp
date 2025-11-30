const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

router.post("/uploadJson", async (req, res) => {
  try {
    const pinRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      }
    );

    return res.json(pinRes.data);
  } catch (err) {
    console.error("Pinata error:", err.response?.data || err.message);
    return res.status(500).json({ error: "IPFS upload failed" });
  }
});

module.exports = router;
