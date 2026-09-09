# Google Maps Platform Setup & Cost Control Guide

RideFlow integrates official modern Google Maps APIs for mapping, Places Autocomplete, and server-side route calculation.

---

## 1. Required Google Cloud APIs

In the [Google Cloud Console](https://console.cloud.google.com/):
1. Create or select a Google Cloud Project (e.g. `RideFlow-Production`).
2. Navigate to **APIs & Services** > **Library** and enable:
   - **Maps JavaScript API** (for interactive browser map, markers, route polylines)
   - **Places API (New)** (for autocomplete location search and place details)
   - **Routes API** (for server-side authoritative distance and travel duration)
   - **Geocoding API** (for converting coordinates into human-readable street addresses)

---

## 2. API Key Separation & Restrictions

RideFlow strictly enforces separation between client-side and server-side credentials:

### A. Client/Browser Key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
- Set in: `apps/web/.env.local`
- **Application Restrictions**: HTTP referrers (websites)
  - Allow: `http://localhost:3000/*` (development)
  - Allow: `https://your-production-domain.com/*` (production)
- **API Restrictions**: Restrict this key *only* to:
  - Maps JavaScript API
  - Places API (New)

### B. Server Routing Key (`GOOGLE_MAPS_SERVER_API_KEY`)
- Set in: `apps/api/.env`
- **Application Restrictions**: IP addresses (your backend server or container egress IPs)
- **API Restrictions**: Restrict this key *only* to:
  - Routes API
  - Geocoding API
- Never expose this key to `apps/web` or commit it to source control.

---

## 3. Billing Setup & Free Usage Allowances

- Google Cloud offers a **\$200 monthly credit** on Google Maps Platform products for each billing account.
- For most low-to-medium volume development and testing, standard usage stays well within the \$200 monthly allowance.

### Setting Up Budget Alerts
1. In Google Cloud Console, navigate to **Billing** > **Budgets & Alerts**.
2. Click **Create Budget**.
3. Set a monthly target (e.g. \$25 or \$50).
4. Configure threshold rules (e.g. 50%, 90%, 100% of budget).
5. Specify email notifications for administrators.

> **CRITICAL WARNING ON BUDGET ALERTS:**
> Budget alerts **DO NOT automatically disable APIs or shut down traffic** when exceeded. They are purely notifications. To prevent unexpected runaway charges:
> - Set daily quota caps under **APIs & Services** > **Quotas** (e.g., maximum 500 requests/day per API).
> - Enable RideFlow's backend request caching and rate limiters.

---

## 4. Cost Optimization in RideFlow

RideFlow implements multiple best practices to minimize API consumption:
1. **Debounced Address Queries**: Autocomplete searches in the UI are debounced by 300ms so queries are only dispatched when typing pauses.
2. **Minimal Field Masking**: Only required fields (`displayName`, `formattedAddress`, `location`) are requested from Places API.
3. **Places Autocomplete Session Tokens**: Places queries bundle keystrokes into a single billable session.
4. **Backend-Calculated Routes**: The client does not independently call Routes API; the backend calculates distance and duration once during quote generation.
5. **Permitted Terms & Caching**: Latitudes/longitudes and place IDs are stored only as necessary for trip execution. Google content is not cached beyond permitted Terms of Service.
6. **DEMO_MODE Fallback**: Setting `DEMO_MODE=true` in `apps/api/.env` and `apps/web/.env.local` runs the application using synthetic coordinates and mock routing, consuming \$0 in API credits.
