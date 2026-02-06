// server.js — FINAL, CLEAN, WORKING VERSION
// Uses Google Places API (New) v1 correctly

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // npm i node-fetch@2
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const KEY = process.env.PLACES_KEY;

if (!KEY) {
  console.error('❌ PLACES_KEY missing in .env');
  process.exit(1);
}

// Serve static frontend files
app.use(express.static(path.join(__dirname, '/')));

// --------------------------------------------------
// 1️⃣ Nearby search (Places API v1)
// --------------------------------------------------
app.get('/places/nearby', async (req, res) => {
  const { lat, lng, radius = 1500, type = 'cafe', maxResults = 20 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat & lng required' });
  }

  const url = 'https://places.googleapis.com/v1/places:searchNearby';

  const body = {
    locationRestriction: {
      circle: {
        center: {
          latitude: Number(lat),
          longitude: Number(lng)
        },
        radius: Number(radius)
      }
    },
    includedTypes: [type],
    maxResultCount: Number(maxResults)
  };

  console.log('--- PLACES REQUEST BODY ---');
  console.log(JSON.stringify(body, null, 2));

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': KEY,
        // ✅ ONLY valid fields — this is CRITICAL
        'X-Goog-FieldMask':
          'places.id,places.displayName.text,places.formattedAddress,places.rating,places.photos'
      },
      body: JSON.stringify(body)
    });

    const text = await upstream.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      console.error('❌ Non-JSON response:', text);
      return res.status(502).send(text);
    }

    if (!upstream.ok) {
      console.error('❌ Places API error:', data);
      return res.status(upstream.status).json(data);
    }

    // Normalize response for frontend
    const results = (data.places || []).map(p => ({
      name:
        p.displayName?.text ||
        p.formattedAddress ||
        p.id ||
        'Unknown',
      place_id: p.id, // ✅ ONLY valid ID
      rating: p.rating || null,
      photos: p.photos || [],
      _raw: p
    }));

    res.json({ results, status: 'OK' });

  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --------------------------------------------------
// 2️⃣ Photo proxy — CORRECT v1 /media endpoint
// --------------------------------------------------
app.get('/places/photo', async (req, res) => {
  const photoName = req.query.name;

  if (!photoName) {
    return res.status(400).send('Missing photo name');
  }

  // photoName format:
  // places/ChIJ.../photos/ABC...
  const url =
    `https://places.googleapis.com/v1/${photoName}/media` +
    `?maxWidthPx=400&key=${KEY}`;

  console.log('Fetching photo:', url);

  try {
    const upstream = await fetch(url);

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error('❌ Photo fetch failed:', upstream.status, text);
      return res.status(upstream.status).send(text);
    }

    res.set(
      'Content-Type',
      upstream.headers.get('content-type') || 'image/jpeg'
    );

    upstream.body.pipe(res);

  } catch (err) {
    console.error('❌ Photo proxy error:', err);
    res.status(500).send('Photo proxy error');
  }
});

// --------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
