#!/bin/bash
curl -X POST https://dizplai-cpm-calculator.onrender.com/api/admin/remove-industry \
  -H "Content-Type: application/json" \
  -d '{"password": "dizplai2026admin", "slug": "food_delivery"}'
