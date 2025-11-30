const express = require("express");
const cors = require("cors");
require("dotenv").config();   // ← MUST BE FIRST

const ipfsRoutes = require("./routes/ipfs");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/ipfs", ipfsRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
