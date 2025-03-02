const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

// Serwujemy pliki statyczne z folderu public (index.html itd.)
app.use(express.static(path.join(__dirname, "public")));

// Endpoint proxy: /api/trams – pobiera linie 3 i 5 z MPK
app.get("/api/trams", async (req, res) => {
  try {
    // Wywołujemy POST do https://mpk.wroc.pl/bus_position
    // z parametrami linii 3 i 5 w formacie x-www-form-urlencoded
    const resp = await fetch("https://mpk.wroc.pl/bus_position", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        "busList[bus][]": "3",
        "busList[bus][]": "5"
      })
    });
    // Odpowiedź to JSON tablica obiektów: [{name: "3", type: "tram", x: 51..., y: 17...}, ...]
    const data = await resp.json();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.toString() });
  }
});

// Odpalamy serwer
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
