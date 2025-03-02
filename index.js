const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/api/trams", async (req, res) => {
    try {
        const response = await axios.get("https://www.wroclaw.pl/open-data/api/action/datastore_search", {
            params: { resource_id: "17308285-3977-42f7-81b7-fdd168c210a2", limit: 50 }
        });

        if (!response.data || !response.data.result || !response.data.result.records) {
            return res.status(500).json({ error: "Brak poprawnych danych" });
        }

        const vehicles = response.data.result.records.map(vehicle => ({
            line: vehicle.Nazwa_Linii || "Nieznana",
            type: vehicle.Nr_Boczny.startsWith("1") ? "bus" : "tram", // Przykładowa logika
            lat: vehicle.Ostatnia_Pozycja_Szerokosc,
            lon: vehicle.Ostatnia_Pozycja_Dlugosc
        }));

        res.json(vehicles);
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
        res.status(500).json({ error: "Błąd pobierania danych" });
    }
});

app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});
