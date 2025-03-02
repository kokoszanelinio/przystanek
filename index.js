const express = require("express");
const fetch = require("node-fetch"); // v2.x

const path = require("path");
const app = express();

// Serwujemy statyczny folder "public"
app.use(express.static(path.join(__dirname, "public")));

// Endpoint /api/all – 3, 5, 114 w jednej paczce
app.get("/api/all", async (req, res) => {
  try {
    // Jedno wywołanie do mpk.wroc.pl
    const resp = await fetch("https://mpk.wroc.pl/bus_position", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "busList[bus][]": "3",
        "busList[bus][]": "5",
        "busList[bus][]": "114"
      })
    });
    const data = await resp.json(); 
    // data = [{name: "3", type: "tram", x: 51..., y: 17...}, {...}, {...}]

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serwer działa na porcie", PORT);
});
