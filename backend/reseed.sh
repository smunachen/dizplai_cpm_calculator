#!/bin/bash
curl -X POST https://dizplai-cpm-calculator.onrender.com/api/admin/reseed-industries \
  -H "Content-Type: application/json" \
  -d '{"password": "dizplai2026admin"}'
