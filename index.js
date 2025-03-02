const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const WROCLAW_API_URL = "https://www.wroclaw.pl/open-data/api/action/datastore_search";
const RESOURCE_ID = "17308285-3977-42f7-81b7-fdd168c210a2";

app.get('/api/trams', async (req, res) => {
    try {
        const response = await axios.get(`${WROCLAW_API_URL}?resource_id=${RESOURCE_ID}&limit=1000`);
        const vehicles = response.data.result.records;

        const filteredVehicles = vehicles.map(v => ({
            name: v.Linia,
            type: v.TypPojazdu.toLowerCase(),
            x: v.Lon,
            y: v.Lat,
            odjazd: Math.floor(Math.random() * 20) + 1
        }));

        res.json(filteredVehicles);
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
        res.status(500).json({ error: "Nie udało się pobrać danych z API" });
    }
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});
