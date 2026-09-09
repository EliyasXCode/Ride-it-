# RideFlow API Reference

Base path: `/api/v1`

All responses follow the unified schema:
```json
{
  "success": true,
  "data": { ... },
  "error": { "code": "STRING", "message": "STRING", "details": { ... } }
}
```

---

## 1. Authentication (`/auth`)
- `POST /auth/register` — Register rider or driver (`name`, `email`, `password`, `role`, `phone`)
- `POST /auth/login` — Sign in and create HttpOnly session cookie
- `POST /auth/logout` — Invalidate session and clear cookie
- `GET /auth/me` — Current authenticated user profile and driver profile if applicable
- `POST /auth/forgot-password` — Request password reset link
- `POST /auth/reset-password` — Reset password using token

---

## 2. Fares & Routes (`/fares`)
- `POST /fares/estimate` — Calculate route distance, duration, and fare breakdown across Economy, Comfort, XL
  - Body: `{ pickup: LocationAddress, dropoff: LocationAddress, promoCode?: string }`
  - Returns: Array of vehicle options with locked `quoteToken` (expires in 10 minutes)

---

## 3. Rides (`/rides`)
- `POST /rides/book` — Request a ride with idempotency key and quote token
- `GET /rides/active` — Get the current active ride for the authenticated user
- `GET /rides/:id` — Get specific ride details (authorized rider, driver, or admin)
- `POST /rides/:id/cancel` — Cancel ride with reason
- `POST /rides/:id/rate` — Submit 1-5 star rating and feedback
- `GET /rides/history` — Paginated ride history for rider or driver
- `GET /rides/shared/:token` — Public minimal trip status for emergency sharing

---

## 4. Driver Operations (`/drivers`)
- `POST /drivers/register` — Submit vehicle and license info for admin review
- `POST /drivers/status` — Toggle status: `online` or `offline`
- `POST /drivers/location` — Send location update `{ lat, lng, heading }`
- `POST /drivers/rides/:id/arrived` — Mark arrived at pickup
- `POST /drivers/rides/:id/verify-pin` — Submit rider's 4-digit PIN to start trip
- `POST /drivers/rides/:id/complete` — Complete trip and record final fare
- `GET /drivers/earnings` — Earnings breakdown, ride statistics, and ratings

---

## 5. Admin Portal (`/admin`)
- `GET /admin/users` — List and search users, filter by role
- `POST /admin/users/:id/suspend` — Suspend or reactivate user
- `GET /admin/drivers/pending` — List drivers awaiting approval
- `POST /admin/drivers/:id/approve` — Approve or reject driver application
- `GET /admin/rides` — All rides with real-time status and filter options
- `GET /admin/metrics` — Dashboard stats (revenue, active rides, completed rides)
- `POST /admin/pricing` — Update base fare, per-km, per-min, booking fee

---

## 6. AI Assistant (`/ai`)
- `POST /ai/chat` — Contextual chat with Gemini assistant
  - Body: `{ message: string, conversationHistory?: [...] }`
  - Returns: `{ reply: string, proposedBooking?: { ... }, suggestedAction: string }`

---

## 7. Payments (`/payments`)
- `POST /payments/create-intent` — Create Stripe PaymentIntent for card payments
- `POST /payments/webhook` — Process signed Stripe webhook notifications
- `POST /payments/collect-cash` — Driver confirms cash collection at end of trip

---

## 8. Support & Places (`/support`, `/places`)
- `POST /support/tickets` — Create support ticket
- `GET /support/tickets` — Get user's support tickets
- `GET /places/saved` — Get user's saved locations (Home, Work, Favorites)
- `POST /places/saved` — Save a new location
- `DELETE /places/saved/:id` — Delete a saved location
