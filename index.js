const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Włączamy CORS i serwujemy folder public
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Główna strona
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint API: /api/all – pobieramy wszystkie pojazdy z open data, filtrujemy 3,5,114
app.get("/api/all", async (req, res) => {
  try {
    // 1. Pobieramy dane z open data
    const response = await axios.get("https://www.wroclaw.pl/open-data/api/action/datastore_search", {
      params: {
        resource_id: "17308285-3977-42f7-81b7-fdd168c210a2",
        limit: 1000
      }
    });

    // Sprawdzamy czy mamy records
    if (!response.data?.result?.records) {
      return res.status(500).json({ error: "Brak poprawnych danych w API" });
    }

    // 2. Wyciągamy interesujące pojazdy (linie 3,5,114)
    const all = response.data.result.records;

    // Filtrujemy (linia 3,5,114) – dopasowanie w .Nazwa_Linii
    const needed = all.filter(v => ["3","5","114"].includes(v.Nazwa_Linii));

    // 3. Mapujemy do obiektu: line, type (tram/bus?), lat, lon
    const vehicles = needed.map(v => {
      // Typ pojazdu – prosta heurystyka (Nr_Boczny zaczyna się np. od '9'?)
      const isTram = v.Nr_Boczny && v.Nr_Boczny.startsWith("9");
      const type = isTram ? "tram" : "bus";

      // Koordy – w pliku mają nazwy: Ostatnia_Pozycja_Szerokosc / Dlugosc
      const lat = parseFloat(v.Ostatnia_Pozycja_Szerokosc) || 0;
      const lon = parseFloat(v.Ostatnia_Pozycja_Dlugosc) || 0;

      return {
        line: v.Nazwa_Linii || "???",
        type,
        lat,
        lon
      };
    });

    res.json(vehicles);

  } catch (err) {
    console.error("Błąd pobierania danych:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Odpalamy serwer
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie http://localhost:${PORT}`);
});
