const express = require('express');
const db = require('./db');

const router = express.Router();

// POST endpoint to save drawing data (update markers for the user)
router.post('/saveDrawing', (req, res) => {
  const { userId, markers } = req.body;

  // Convert markers array to JSON
  const markersJSON = JSON.stringify(markers);

  // Update query to modify existing data for the user
  const query = 'INSERT INTO drawings (userId, markers) VALUES (?, ?) ON DUPLICATE KEY UPDATE markers = ?';

  db.query(query, [userId, markersJSON, markersJSON], (err, result) => {
    if (err) {
      console.error('Error saving data:', err);
      return res.status(500).send('Error saving data');
    }
    res.status(200).send('Drawing data saved');
  });
});


// GET endpoint to load drawing data
router.get('/loadDrawing/:userId', (req, res) => {
  const userId = req.params.userId;

  db.query('SELECT markers FROM drawings WHERE userId = ?', [userId], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      try {
        const markersData = results.map(row => {
          return typeof row.markers === 'string' ? JSON.parse(row.markers) : row.markers;
        });

        const allMarkers = markersData.flat();
        res.json({ markers: allMarkers });
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        res.status(500).send('Error parsing stored data');
      }
    } else {
      res.status(404).send('No data found for the given User ID');
    }
  });
});

module.exports = router;
