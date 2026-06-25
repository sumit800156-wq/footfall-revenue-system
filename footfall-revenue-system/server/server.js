const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const dataFile = path.join(__dirname, "data.json");

// ---------- helper functions ----------
function readData() {
  try {
    const data = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// ---------- routes ----------

// Login demo route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    return res.json({
      success: true,
      message: "Login successful",
      user: { username: "admin", role: "admin" },
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid username or password",
  });
});

// Get all entries
app.get("/entries", (req, res) => {
  const entries = readData();
  res.json(entries);
});

// Add entry
app.post("/entries", (req, res) => {
  const entries = readData();

  const {
    outlet,
    date,
    footfall,
    drivers,
    restaurantRevenue,
    roomRevenue,
    otherRevenue,
    marketingExpense,
    remarks,
  } = req.body;

  if (!outlet || !date) {
    return res.status(400).json({ message: "Outlet and date are required" });
  }

  const newEntry = {
    id: Date.now(),
    outlet,
    date,
    footfall: Number(footfall) || 0,
    drivers: Number(drivers) || 0,
    restaurantRevenue: Number(restaurantRevenue) || 0,
    roomRevenue: Number(roomRevenue) || 0,
    otherRevenue: Number(otherRevenue) || 0,
    marketingExpense: Number(marketingExpense) || 0,
    remarks: remarks || "",
  };

  newEntry.totalRevenue =
    newEntry.restaurantRevenue +
    newEntry.roomRevenue +
    newEntry.otherRevenue;

  entries.push(newEntry);
  writeData(entries);

  res.status(201).json({
    message: "Entry saved successfully",
    entry: newEntry,
  });
});

// Delete entry
app.delete("/entries/:id", (req, res) => {
  const entries = readData();
  const id = Number(req.params.id);

  const filtered = entries.filter((entry) => entry.id !== id);
  writeData(filtered);

  res.json({ message: "Entry deleted successfully" });
});

// Reset all data
app.delete("/reset", (req, res) => {
  writeData([]);
  res.json({ message: "All data reset successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
