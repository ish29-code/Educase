import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { pool } from '../db.js';

const router = Router();

// Helpers
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, msg: e.msg }))
    });
  }
  next();
}

/**
 * POST /api/addSchool
 * Body: { name, address, latitude, longitude }
 */
router.post(
  '/addSchool',
  body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 255 }),
  body('address').trim().notEmpty().withMessage('address is required').isLength({ max: 500 }),
  body('latitude').notEmpty().withMessage('latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('latitude must be between -90 and 90')
    .toFloat(),
  body('longitude').notEmpty().withMessage('longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('longitude must be between -180 and 180')
    .toFloat(),
  handleValidation,
  async (req, res, next) => {
    const { name, address, latitude, longitude } = req.body;
    try {
      const [result] = await pool.query(
        'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
        [name, address, latitude, longitude]
      );
      res.status(201).json({
        id: result.insertId,
        name,
        address,
        latitude,
        longitude
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/listSchools?lat=..&lng=..
 * Returns schools sorted by distance (km) from the given point
 */
router.get(
  '/listSchools',
  query('latitude').notEmpty().withMessage('lat is required')
    .isFloat({ min: -90, max: 90 }).withMessage('lat must be between -90 and 90')
    .toFloat(),
  query('longitude').notEmpty().withMessage('lng is required')
    .isFloat({ min: -180, max: 180 }).withMessage('lng must be between -180 and 180')
    .toFloat(),
  handleValidation,
  async (req, res, next) => {
    const { lat, lng } = req.query;
    try {
      const [rows] = await pool.query('SELECT * FROM schools');
      const enriched = rows.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        latitude: s.latitude,
        longitude: s.longitude,
        distance_km: Number(haversineDistance(lat, lng, s.latitude, s.longitude).toFixed(3))
      }));
      enriched.sort((a, b) => a.distance_km - b.distance_km);
      res.json({ count: enriched.length, schools: enriched });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

