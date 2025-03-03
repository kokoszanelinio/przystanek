const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Zezwalamy na CORS i serwujemy pliki statyczne z folderu public
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Strona główna
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint: /api/arrivals
app.get("/api/arrivals", async (req, res) => {
  try {
    // Parametry CKAN DataStore:
    // - resource_id: ID zasobu w CKAN (np. '17308285-3977-42f7-81b7-fdd168c210a2')
    // - limit: ile rekordów
    // - q: dowolny filtr, np. 'Linia=3'
    // - lub rozbudowana kwerenda SQL w '/datastore_search_sql'
    
    const resourceID = "17308285-3977-42f7-81b7-fdd168c210a2"; // wstaw swój
    const limit = 20; // np. 20 rekordów
    const query = ""; // np. '' albo 'jones' w param. q

    const response = await axios.get("https://www.wroclaw.pl/open-data/api/action/datastore_search", {
      params: {
        resource_id: resourceID,
        limit: limit,
        q: query // np. 'Linia:3'
      }
    });
    
    // Zakładamy, że dane są w response.data.result.records
    if (!response.data || !response.data.result) {
      return res.status(500).json({ error: "Brak poprawnej odpowiedzi z CKAN" });
    }

    const records = response.data.result.records;

    // Przykładowo mapujemy wyniki do tablicy z polami (np. 'Linia', 'Kierunek', 'Czas_odjazdu')
    const arrivals = records.map(r => {
      return {
        linia: r.Linia || "Brak linii",
        kierunek: r.Kierunek || "???",
        odjazd: r.Czas_odjazdu || "--"
      };
    });

    res.json(arrivals);
  } catch (err) {
    console.error("Błąd pobierania z open-data:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Odpalamy serwer
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
