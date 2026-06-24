require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();


app.use(cors());
app.use(express.json());

// Get All Entries
app.get("/api/entries", (req, res) => {
  if (!fs.existsSync("data.json")) {
    return res.json([]);
  }

  const data = JSON.parse(fs.readFileSync("data.json"));
  res.json(data);
});

// Add Entry
app.post("/api/entries", (req, res) => {
  let data = [];

  if (fs.existsSync("data.json")) {
    data = JSON.parse(fs.readFileSync("data.json"));
  }

  data.push(req.body);

  fs.writeFileSync(
    "data.json",
    JSON.stringify(data, null, 2)
  );

  res.json({
    success: true,
    message: "Entry Added Successfully",
  });
});

// Delete Entry
app.delete("/api/entries/:id", (req, res) => {
  let data = [];

  if (fs.existsSync("data.json")) {
    data = JSON.parse(fs.readFileSync("data.json"));
  }

  data.splice(Number(req.params.id), 1);

  fs.writeFileSync(
    "data.json",
    JSON.stringify(data, null, 2)
  );

  res.json({
    success: true,
    message: "Entry Deleted Successfully",
  });
});

// Update Entry
app.put("/api/entries/:id", (req, res) => {
  let data = [];

  if (fs.existsSync("data.json")) {
    data = JSON.parse(fs.readFileSync("data.json"));
  }

  data[Number(req.params.id)] = req.body;

  fs.writeFileSync(
    "data.json",
    JSON.stringify(data, null, 2)
  );

  res.json({
    success: true,
    message: "Entry Updated Successfully",
  });
});

// Home Route
app.get("/", (req, res) => {
  res.send("Mannat Footfall & Revenue API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});