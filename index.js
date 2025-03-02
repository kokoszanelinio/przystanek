const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const csv = require("csv-parser");
const app = express();

app.use(express.static("public"));

// Wczytanie danych GTFS
let stops = {};
let trips = {};
let routes = {};

// Wczytanie stops.txt
fs.createReadStream("gtfs/stops.txt")
  .pipe(csv())
  .on("data", (row) => {
    stops[row.stop_id] = {
      lat: parseFloat(row.stop_lat),
      lon: parseFloat(row.stop_lon),
      name: row.stop_name
    };
  })
  .on("end", () => console.log("Stops loaded"));

// Wczytanie trips.txt
fs.createReadStream("gtfs/trips.txt")
  .pipe(csv())
  .on("data", (row) => {
    trips[row.trip_id] = {
      route_id: row.route_id,
      direction: row.trip_headsign
    };
  })
  .on("end", () => console.log("Trips loaded"));

// Wczytanie routes.txt
fs.createReadStream("gtfs/routes.txt")
  .pipe(csv())
  .on("data", (row) => {
    routes[row.route_id] = row.route_long_name;
  })
  .on("end", () => console.log("Routes loaded"));

// Endpoint /api/all
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

    // Dodanie kierunku z GTFS (uproszczone)
    data = data.map(vehicle => {
      const routeId = vehicle.name; // np. "3"
      const direction = routes[routeId] ? routes[routeId] : "Brak info";
      return {
        ...vehicle,
        direction: direction
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
