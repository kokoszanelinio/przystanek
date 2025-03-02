const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Serwer działa!');
});

app.get('/api/trams', async (req, res) => {
    try {
        const response = await axios.get('https://www.wroclaw.pl/open-data/api/action/datastore_search', {
            params: {
                resource_id: '17308285-3977-42f7-81b7-fdd168c210a2',
                limit: 100
            }
        });

        const vehicles = response.data.result.records.map(vehicle => ({
            name: vehicle.Nazwa_Linii,
            type: vehicle.Nr_Boczny.startsWith('9') ? 'tram' : 'bus',
            y: vehicle.Ostatnia_Pozycja_Dlugosc,
            x: vehicle.Ostatnia_Pozycja_Szerokosc
        }));

        res.json(vehicles);
    } catch (error) {
        console.error('Błąd pobierania danych:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});
