# Deploying to Render

## Quick Start

1. **Push to GitHub:**
   ```bash
   cd dizplai-cpm-calculator
   git init
   git add .
   git commit -m "Initial commit - Dizplai CPM Calculator"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create PostgreSQL Database on Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "PostgreSQL"
   - Name: `dizplai-cpm-calculator-db`
   - Plan: Free
   - Click "Create Database"
   - **Save the connection details** (Internal Database URL)

3. **Set Up Database Schema:**
   - Once database is created, go to "Shell" tab in database dashboard
   - Run schema creation:
   ```sql
   -- Copy/paste contents of backend/database/schema.sql
   -- Then copy/paste contents of backend/database/seed.sql
   ```
   
   OR use the "Connect" button to get connection string and run locally:
   ```bash
   psql <connection-string> -f backend/database/schema.sql
   psql <connection-string> -f backend/database/seed.sql
   ```

4. **Deploy Backend to Render:**
   - In Render Dashboard, click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** dizplai-cpm-calculator-api
     - **Region:** Oregon (US West)
     - **Branch:** main
     - **Root Directory:** backend
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free

5. **Add Environment Variables:**
   In the web service settings, add:
   ```
   NODE_ENV=production
   DB_HOST=<from database internal connection>
   DB_PORT=5432
   DB_NAME=dizplai_cpm_calculator
   DB_USER=<from database connection>
   DB_PASSWORD=<from database connection>
   ```
   
   **Tip:** Render provides an "Internal Database URL" - parse it to get these values.
   Format: `postgres://USER:PASSWORD@HOST:PORT/DATABASE`

6. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Wait for "Live" status (3-5 minutes)

7. **Test Your API:**
   ```bash
   # Your API will be at: https://dizplai-cpm-calculator-api.onrender.com
   
   # Test health endpoint
   curl https://dizplai-cpm-calculator-api.onrender.com/health
   
   # Get industries
   curl https://dizplai-cpm-calculator-api.onrender.com/api/benchmarks/industries
   ```

## Alternative: Using render.yaml (Blueprint)

1. **Push code with render.yaml:**
   ```bash
   git add render.yaml
   git commit -m "Add Render blueprint"
   git push
   ```

2. **Deploy from Blueprint:**
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render will automatically detect render.yaml
   - Configure database credentials
   - Click "Apply"

## Environment Variables Reference

Required environment variables for the backend:

```env
NODE_ENV=production
PORT=5000  # Render sets this automatically
DB_HOST=<postgres-hostname>
DB_PORT=5432
DB_NAME=dizplai_cpm_calculator
DB_USER=<database-user>
DB_PASSWORD=<database-password>
```

## Post-Deployment

### Verify Database Connection
```bash
curl https://dizplai-cpm-calculator-api.onrender.com/api/benchmarks/industries
```

Expected response:
```json
[
  {
    "id": 1,
    "name": "Sports",
    "slug": "sports",
    "video_cpm_avg": "25.00",
    "notes": "Spikes during major events..."
  },
  ...
]
```

### Test Calculation Endpoint
```bash
curl -X POST https://dizplai-cpm-calculator-api.onrender.com/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "industry_id": 1,
    "stream_length_minutes": 180,
    "avg_view_time_minutes": 45,
    "total_views": 50000
  }'
```

## Troubleshooting

### Database Connection Issues
- Verify DB_HOST is the **internal** connection string (not external)
- Check DB_PASSWORD doesn't contain special characters that need escaping
- Ensure database is in same region as web service

### Build Failures
- Check Node version (use Node 18+ in package.json engines)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### 503 Service Unavailable
- Free tier spins down after inactivity (first request takes 30-60s)
- Check if database is active
- View logs in Render dashboard

## Free Tier Limitations

**PostgreSQL:**
- 1 GB storage
- Expires after 90 days (you'll get renewal email)
- Sufficient for this calculator

**Web Service:**
- Spins down after 15 minutes of inactivity
- 750 hours/month free
- First request after spin-down takes 30-60 seconds

## Production Considerations

For production deployment:
1. Upgrade to paid tier for always-on service
2. Add custom domain
3. Enable auto-deploy on push
4. Set up monitoring/alerts
5. Configure CORS for your frontend domain

## Your API Endpoints

Once deployed, your base URL will be:
`https://dizplai-cpm-calculator-api.onrender.com`

Endpoints:
- `GET /health` - Health check
- `GET /api/benchmarks/industries` - All industries
- `GET /api/benchmarks/multipliers` - All multipliers
- `POST /api/calculator/calculate` - Calculate sponsorship value
- And 5 more (see API_TESTING.md)

## Update Frontend to Use Production API

Once deployed, update your frontend to use:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  'https://dizplai-cpm-calculator-api.onrender.com';
```

Then set in frontend/.env:
```
REACT_APP_API_URL=https://dizplai-cpm-calculator-api.onrender.com
```
