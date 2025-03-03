const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Włączamy CORS i serwujemy folder `public` (gdzie jest index.html)
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Główna ścieżka – zwraca plik index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint: /api/arrivals – pobiera dane z Wrocław Open Data
app.get("/api/arrivals", async (req, res) => {
  try {
    // ID zasobu w CKAN (dane o pojazdach MPK)
    const resourceID = "17308285-3977-42f7-81b7-fdd168c210a2";
    // Ile rekordów pobrać:
    const limit = 10; 
    // Tu można dodać param: q: "Linia:3" itp., jeśli chcesz filtrować

    // Żądanie GET do CKAN
    const response = await axios.get("https://www.wroclaw.pl/open-data/api/action/datastore_search", {
      params: {
        resource_id: resourceID,
        limit: limit
      }
    });

    // Dane w response.data.result.records
    if (!response.data || !response.data.result) {
      return res.status(500).json({ error: "Błędna odpowiedź z open-data" });
    }

    const records = response.data.result.records;

    // Mapa, np. { linia, kierunek, odjazd }
    const arrivals = records.map(r => ({
      linia: r.Linia || "Brak linii",
      kierunek: r.Kierunek || "Brak kierunku",
      odjazd: r.Czas_odjazdu || "--"
    }));

    res.json(arrivals);
  } catch (error) {
    console.error("Błąd pobierania danych:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Start
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie http://localhost:${PORT}`);
});
