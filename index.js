const express = require("express");
const fetch = require("node-fetch"); // <-- ważne, by importować z "node-fetch" w wersji 2.x

const path = require("path");
const app = express();

// Serwujemy pliki statyczne z folderu public
app.use(express.static(path.join(__dirname, "public")));

// Endpoint: /api/trams – pobiera linie 3 i 5
app.get("/api/trams", async (req, res) => {
  try {
    const resp = await fetch("https://mpk.wroc.pl/bus_position", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "busList[bus][]": "3",
        "busList[bus][]": "5"
      })
    });

    const data = await resp.json(); // tablica obiektów np. { name: "3", x: 51..., y: 17... }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString() });
  }
});

// Uruchamiamy serwer
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serwer działa na porcie", PORT);
});
