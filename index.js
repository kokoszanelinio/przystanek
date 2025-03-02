const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const csv = require("csv-parser");
const app = express();

app.use(express.static("public"));

// Wczytanie GTFS
let trips = [];
fs.createReadStream("trips.txt")
  .pipe(csv())
  .on("data", (row) => trips.push(row))
  .on("end", () => console.log("Trips loaded"));

// API dla wszystkich linii
app.get("/api/all", async (req, res) => {
  try {
    const resp = await fetch("https://mpk.wroc.pl/bus_position", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "busList[bus][]": "3",
        "busList[bus][]": "5",
        "busList[bus][]": "114"
      })
    });
    let data = await resp.json();

    // Dodanie kierunków z GTFS
    data = data.map(vehicle => {
      const trip = trips.find(t => t.route_id === vehicle.name);
      return {
        ...vehicle,
        direction: trip ? trip.trip_headsign : "Brak info"
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(3000, () => console.log("Serwer działa na porcie 3000"));
