# Dizplai CPM Calculator

**Live Stream Sponsorship Placement Value Calculator**

A professional tool for calculating the fair market value of unskippable, integrated sponsorship placements in live-streamed content. Applies industry-validated premium multipliers (8-10x) to base CPM rates.

---

## Features

- 🎯 **Industry CPM Benchmarks** - 6 verticals (Sports, Fashion, Gambling, Beauty, Banking, Food Delivery)
- 📊 **Premium Multipliers** - Research-backed 8.19x composite multiplier for live sponsorships
- 🔢 **Smart Calculations** - Frequency analysis, unique viewer estimation, inventory optimization
- 💰 **Multi-Brand Support** - Calculate multiple sponsor placements in same stream (30% max ad load)
- 📈 **Transparent Methodology** - Full documentation of data sources and calculation process

---

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL (with TimescaleDB for future time-series analysis)
- RESTful API

**Frontend:**
- React
- Recharts (data visualization)
- Dark theme design (StoryTeller-inspired aesthetic)

---

## Project Structure

```
dizplai-cpm-calculator/
├── backend/
│   ├── database/
│   │   ├── schema.sql          # Database table definitions
│   │   └── seed.sql            # Industry benchmarks & multipliers
│   ├── routes/
│   │   ├── benchmarks.js       # GET industry CPM data
│   │   └── calculator.js       # POST calculate sponsorship value
│   ├── services/
│   │   └── pricingEngine.js    # Core calculation logic
│   └── server.js               # Express app entry point
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Dashboard.jsx
│       │   ├── IndustrySelector.jsx
│       │   ├── MultiplierInputs.jsx
│       │   └── ValueOutput.jsx
│       └── App.jsx
├── docs/
│   └── METHODOLOGY_AND_DATA_SOURCES.md  # Complete methodology report
└── README.md
```

---

## Database Setup

### Prerequisites
- PostgreSQL 14+ installed locally or remote instance

### Setup Steps

1. **Create Database:**
```bash
psql -U postgres
CREATE DATABASE dizplai_cpm_calculator;
\q
```

2. **Run Schema:**
```bash
psql -U postgres -d dizplai_cpm_calculator -f backend/database/schema.sql
```

3. **Load Seed Data:**
```bash
psql -U postgres -d dizplai_cpm_calculator -f backend/database/seed.sql
```

4. **Verify Setup:**
```bash
psql -U postgres -d dizplai_cpm_calculator
SELECT * FROM industries;
SELECT * FROM multipliers;
```

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## Calculation Methodology

See full documentation: [METHODOLOGY_AND_DATA_SOURCES.md](./docs/METHODOLOGY_AND_DATA_SOURCES.md)

**Summary:**

1. Select content type → Retrieve industry base CPM
2. Apply premium multipliers (8.19x total):
   - Unskippable format: 1.8x
   - Integrated content: 2.5x
   - Live streaming: 1.3x
   - High attention: 1.4x
3. Input stream parameters (length, avg view time, total views)
4. Calculate unique viewers and minimum ad frequency
5. Determine cost per 30s placement
6. Output total inventory value

**Example:**
- Sports content, live stream
- Base CPM: $25 → Premium CPM: $204.75 (8.19x)
- 180 min stream, 45 min avg view time, 50K views
- Result: $10,237.50 per placement, 4 minimum placements = $40,950 total value

---

## Data Sources

Industry benchmarks sourced from:
- eMarketer / Insider Intelligence
- Statista
- IAB (Interactive Advertising Bureau)
- WordStream
- ADOPTER Media, Nielsen, Twitch Reports, CTV Studies

Premium multipliers validated through:
- YouTube sponsorship studies (2025-2026)
- Connected TV advertising research
- Live streaming benchmarks (Twitch, YouTube Live)
- Traditional TV sponsorship pricing

**Last Updated:** February 2026  
**Recommended Update Frequency:** Quarterly

---

## API Endpoints

### Get All Industries
```
GET /api/benchmarks/industries
Response: [{ id, name, slug, video_cpm_avg, notes }]
```

### Get All Multipliers
```
GET /api/benchmarks/multipliers
Response: [{ id, name, category, multiplier_value, description }]
```

### Calculate Sponsorship Value
```
POST /api/calculator/calculate
Body: {
  industry_id: 1,
  stream_length_minutes: 180,
  avg_view_time_minutes: 45,
  total_views: 50000,
  user_selected_frequency: 4  // optional
}
Response: {
  base_cpm: 25.00,
  premium_cpm: 204.75,
  total_multiplier: 8.19,
  unique_watch_sessions: 4.0,
  effective_unique_viewers: 12500,
  min_ad_frequency: 4,
  cost_per_placement: 10237.50,
  max_placements: 108,
  total_inventory_value: 40950.00
}
```

---

## License

Proprietary - Dizplai © 2026

---

## Contact

For questions about methodology or data sources, see [METHODOLOGY_AND_DATA_SOURCES.md](./docs/METHODOLOGY_AND_DATA_SOURCES.md)
