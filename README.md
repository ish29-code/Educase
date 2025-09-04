# School Management APIs (Node.js + Express + MySQL)

Implements two endpoints:

- `POST /api/addSchool` — add a new school with `{ name, address, latitude, longitude }`
- `GET /api/listSchools?lat=<userLat>&lng=<userLng>` — list schools sorted by proximity

## Quick Start (Local)

1. **Install MySQL** and create a database:
   ```sql
   CREATE DATABASE IF NOT EXISTS schooldb;
   USE schooldb;
   ```
2. **Create table** (or let the app auto-create):
   ```sql
   CREATE TABLE IF NOT EXISTS schools (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     address VARCHAR(500) NOT NULL,
     latitude FLOAT NOT NULL,
     longitude FLOAT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
3. **Configure env**: copy `.env.example` to `.env` and fill values.
4. **Install & run**:
   ```bash
   npm i
   npm run dev
   ```

## API

### Add School
`POST /api/addSchool`
```json
{
  "name": "Sunrise Public School",
  "address": "MG Road, Pune",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

**Responses**
- `201 Created`
```json
{
  "id": 1,
  "name": "Sunrise Public School",
  "address": "MG Road, Pune",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```
- `400 Bad Request` when validation fails.

### List Schools
`GET /api/listSchools?lat=18.5204&lng=73.8567`

**Response**
```json
{
  "count": 2,
  "schools": [
    {
      "id": 1,
      "name": "Sunrise Public School",
      "address": "MG Road, Pune",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "distance_km": 0
    }
  ]
}
```

## Deployment

- **Render** (free tier):
  - Create a Web Service from this repo.
  - Runtime: Node 18+. Build Command: `npm i`. Start Command: `npm start`.
  - Add a **Render MySQL** add-on or connect to an external MySQL (e.g., PlanetScale, Aiven). Set env vars.


## Notes
- Distance is calculated using the Haversine formula (km) and rounded to 3 decimals.
- Input validation uses `express-validator`.
