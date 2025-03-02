const express = require('express');
const fetch = require('node-fetch');

const app = express();

// Obsługa plików statycznych z folderu 'public'
app.use(express.static('public'));

// Endpoint pobierający dane pojazdów dla linii 3, 5 i 114
app.get('/api/vehicles', async (req, res) => {
  // Zapytanie SQL do API CKAN, filtrujące pojazdy dla linii 3, 5 i 114
  const sql = `SELECT * FROM "17308285-3977-42f7-81b7-fdd168c210a2" WHERE "Brygada" LIKE '3-%' OR "Brygada" LIKE '5-%' OR "Brygada" LIKE '114-%'`;
  const url = `https://www.wroclaw.pl/open-data/api/action/datastore_search_sql?sql=${encodeURIComponent(sql)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      // Zwróć rekordy pojazdów
      res.json(data.result.records);
    } else {
      res.status(500).json({ error: data.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
