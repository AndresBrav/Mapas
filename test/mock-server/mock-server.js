import express from 'express';

const app = express();

const geodata = {
    "Av. América 123, Cochabamba, Bolivia": { lat: "-17.39345", lon: "-66.15678" },
    "Calle Bolívar 456, La Paz, Bolivia": { lat: "-16.50000", lon: "-68.15000" },
    "Av. Heroínas 789, Cochabamba, Bolivia": { lat: "-17.38900", lon: "-66.16000" },
    "Plaza 14 de Septiembre, Cochabamba, Bolivia": { lat: "-17.38400", lon: "-66.15500" },
    "Av. Pando 321, Cochabamba, Bolivia": { lat: "-17.39500", lon: "-66.15000" },
    "Calle España 111, Santa Cruz, Bolivia": { lat: "-17.78000", lon: "-63.18000" },
    "Av. San Martín 555, Cochabamba, Bolivia": { lat: "-17.38800", lon: "-66.14500" },
    "Calle Lanza 222, La Paz, Bolivia": { lat: "-16.49500", lon: "-68.14500" },
};

app.get('/search', (req, res) => {
    const { q } = req.query;
    if (!q || !geodata[q]) return res.json([]);

    const coords = geodata[q];
    res.json([
        {
            place_id: 1,
            licence: 'Mock',
            osm_type: 'way',
            osm_id: 1,
            lat: coords.lat,
            lon: coords.lon,
            category: 'place',
            type: 'city',
            place_rank: 16,
            importance: 0.1,
            addresstype: 'city',
            name: q,
            display_name: q,
            boundingbox: [
                String(Number.parseFloat(coords.lat) - 0.01),
                String(Number.parseFloat(coords.lat) + 0.01),
                String(Number.parseFloat(coords.lon) - 0.01),
                String(Number.parseFloat(coords.lon) + 0.01),
            ],
        },
    ]);
});

app.get('/route/v1/driving/:coords', (req, res) => {
    const parts = req.params.coords.split(/[;,]/).map(Number);
    const [lng1, lat1, lng2, lat2] = parts;

    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    const distance = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    const duration = Math.round(distance / 50 * 3.6);

    res.json({
        code: 'Ok',
        routes: [
            {
                geometry: {
                    coordinates: [
                        [lng1, lat1],
                        [lng2, lat2],
                    ],
                    type: 'LineString',
                },
                legs: [],
                distance,
                duration,
                weight: distance,
                weight_name: 'distance',
            },
        ],
        waypoints: [
            { hint: '', name: '', location: [lng1, lat1] },
            { hint: '', name: '', location: [lng2, lat2] },
        ],
    });
});

app.listen(4000, () => console.log('Mock maps server running on port 4000'));
