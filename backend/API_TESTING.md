# API Testing Guide

Quick reference for testing the Dizplai CPM Calculator API endpoints.

## Prerequisites

1. Database is set up and seeded
2. Server is running: `npm run dev`
3. Server is accessible at: `http://localhost:5000`

---

## Testing with cURL

### 1. Health Check

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-06T...",
  "database": "connected"
}
```

---

### 2. Get All Industries

```bash
curl http://localhost:5000/api/benchmarks/industries
```

**Expected Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": 1,
      "name": "Sports",
      "slug": "sports",
      "video_cpm_low": "15.00",
      "video_cpm_avg": "25.00",
      "video_cpm_high": "40.00",
      "notes": "Spikes during major events...",
      "last_updated": "..."
    },
    ...
  ]
}
```

---

### 3. Get All Multipliers

```bash
curl http://localhost:5000/api/benchmarks/multipliers
```

**Expected Response:**
```json
{
  "success": true,
  "count": 4,
  "totalMultiplier": 8.19,
  "data": [
    {
      "id": 1,
      "name": "Unskippable Format",
      "category": "format",
      "multiplier_value": "1.80",
      "description": "Non-skippable ads...",
      "is_active": true,
      "sort_order": 1
    },
    ...
  ]
}
```

---

### 4. Get Benchmarks Summary

```bash
curl http://localhost:5000/api/benchmarks/summary
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "industries": [...],
    "multipliers": [...],
    "totalMultiplier": 8.19
  }
}
```

---

### 5. Calculate Sponsorship Value

```bash
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "industry_id": 1,
    "stream_length_minutes": 180,
    "avg_view_time_minutes": 45,
    "total_views": 50000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "sessionId": "uuid...",
  "industry": {
    "id": 1,
    "name": "Sports"
  },
  "multipliers": [...],
  "calculation": {
    "inputs": {
      "baseCPM": 25.00,
      "streamLengthMinutes": 180,
      "avgViewTimeMinutes": 45,
      "totalViews": 50000
    },
    "totalMultiplier": 8.19,
    "premiumCPM": 204.75,
    "uniqueWatchSessions": 4.0,
    "effectiveUniqueViewers": 12500,
    "minAdFrequency": 4,
    "maxPlacements": 108,
    "selectedFrequency": 4,
    "costPerPlacement": 10237.50,
    "totalInventoryValue": 40950.00,
    "adTimeMinutes": 2.0,
    "adTimePercentage": 1.1,
    "costPerUniqueViewer": 3.28
  }
}
```

---

### 6. Calculate with Custom Frequency

```bash
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "industry_id": 3,
    "stream_length_minutes": 120,
    "avg_view_time_minutes": 30,
    "total_views": 100000,
    "user_selected_frequency": 8
  }'
```

---

### 7. Multi-Brand Calculation

First, run a calculation and note the returned calculation ID from the response. Then:

```bash
curl -X POST http://localhost:5000/api/calculator/multi-brand \
  -H "Content-Type: application/json" \
  -d '{
    "calculation_id": 1,
    "brands": [
      { "name": "Brand A", "placements": 4 },
      { "name": "Brand B", "placements": 4 },
      { "name": "Brand C", "placements": 4 }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "calculation_id": 1,
  "result": {
    "brands": [
      {
        "brandName": "Brand A",
        "placements": 4,
        "totalCost": 40950.00,
        "adTimeMinutes": 2.0,
        "percentageOfStream": 1.1
      },
      ...
    ],
    "totals": {
      "placements": 12,
      "cost": 122850.00,
      "adTimeMinutes": 6.0,
      "adPercentage": 3.3,
      "remainingSlots": 96
    }
  }
}
```

---

### 8. Get Calculation History

```bash
curl http://localhost:5000/api/calculator/history?limit=5
```

---

### 9. Get Specific Calculation

```bash
curl http://localhost:5000/api/calculator/calculation/1
```

---

## Testing Scenarios

### Scenario 1: Sports Stream (Super Bowl Style)

**Context:** 3-hour sports live stream, viewers watch 45 minutes average, 50K total views

```bash
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "industry_id": 1,
    "stream_length_minutes": 180,
    "avg_view_time_minutes": 45,
    "total_views": 50000
  }'
```

**Expected Result:**
- Base CPM: $25
- Premium CPM: $204.75 (8.19x)
- Cost per placement: $10,237.50
- Minimum frequency: 4 ads
- Total value: $40,950

---

### Scenario 2: Beauty Tutorial

**Context:** 30-minute beauty tutorial, viewers watch full video, 10K views

```bash
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "industry_id": 4,
    "stream_length_minutes": 30,
    "avg_view_time_minutes": 30,
    "total_views": 10000
  }'
```

**Expected Result:**
- Base CPM: $18
- Premium CPM: $147.42 (8.19x)
- Cost per placement: $1,474.20
- Minimum frequency: 1 ad
- Total value: $1,474.20

---

### Scenario 3: Gambling Stream (High Value)

**Context:** 2-hour poker tournament, 20-minute average view, 25K views

```bash
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "industry_id": 3,
    "stream_length_minutes": 120,
    "avg_view_time_minutes": 20,
    "total_views": 25000
  }'
```

**Expected Result:**
- Base CPM: $50 (highest)
- Premium CPM: $409.50 (8.19x)
- Cost per placement: $10,237.50
- Minimum frequency: 6 ads
- Total value: $61,425

---

## Error Testing

### Invalid Industry ID

```bash
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "industry_id": 999,
    "stream_length_minutes": 60,
    "avg_view_time_minutes": 30,
    "total_views": 10000
  }'
```

**Expected:** 404 error "Industry not found"

---

### Missing Required Fields

```bash
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "industry_id": 1,
    "stream_length_minutes": 60
  }'
```

**Expected:** 400 error "Missing required fields"

---

### Exceeding 30% Ad Load

```bash
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "industry_id": 1,
    "stream_length_minutes": 20,
    "avg_view_time_minutes": 10,
    "total_views": 10000,
    "user_selected_frequency": 50
  }'
```

**Expected:** 500 error "Selected frequency exceeds maximum placements"

---

## Using Postman

1. Import this collection URL (create one from these examples)
2. Set base URL variable: `http://localhost:5000`
3. Run requests in order:
   - Health Check
   - Get Industries
   - Get Multipliers
   - Calculate (save calculation_id from response)
   - Multi-Brand (use saved calculation_id)

---

## Database Verification Queries

After running calculations, verify data was stored:

```sql
-- Check calculations table
SELECT 
  id, 
  session_id,
  industry_id,
  stream_length_minutes,
  total_views,
  premium_cpm,
  total_inventory_value,
  created_at
FROM calculations
ORDER BY created_at DESC
LIMIT 5;

-- Check ad slots
SELECT 
  c.session_id,
  a.brand_name,
  a.placements_purchased,
  a.slot_value
FROM ad_slots a
JOIN calculations c ON a.calculation_id = c.id
ORDER BY a.created_at DESC;
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** 
- Check PostgreSQL is running: `pg_isready`
- Verify .env credentials match database
- Test connection: `psql -U postgres -d dizplai_cpm_calculator`

### Issue: "Industries not found"
**Solution:** 
- Run seed data: `psql -U postgres -d dizplai_cpm_calculator -f database/seed.sql`

### Issue: Port already in use
**Solution:** 
- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill`

---

## Next Steps

Once backend testing is complete:
1. Build React frontend
2. Connect frontend to these API endpoints
3. Implement StoryTeller-style dark theme UI
4. Add data visualization with Recharts
