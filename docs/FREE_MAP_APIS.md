# Where to Get Free Map APIs for RideFlow

RideFlow is engineered with a dual-map architecture: it supports **Google Maps Platform** and has a built-in **100% Free OpenStreetMap / Leaflet** integration that works out of the box with zero keys or credit cards required.

---

## 1. Option A: OpenStreetMap & CartoDB (100% Free Forever — Built-in!)

- **Cost**: **$0.00 / completely free**
- **Credit Card Required**: **NO**
- **API Key Required**: **NO**
- **How it works in RideFlow**:
  - The map component automatically streams real high-resolution street tiles from OpenStreetMap & CartoDB Voyager.
  - Reverse geocoding (converting GPS latitude/longitude into real street addresses) is powered by OpenStreetMap Nominatim for free.
  - You can immediately open [http://localhost:3000/booking](http://localhost:3000/booking) to see real interactive street maps with zoom, pan, pickup/dropoff pins, and animated driver cars.

---

## 2. Option B: Google Maps Platform ($200 Monthly Free Credit)

Google gives every account **$200 in free usage credits every single month**, which provides:
- ~28,500 interactive web map loads per month for free
- ~40,000 Routes API directions calculations per month for free

### Step-by-Step Guide to Get Your Free Key:
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with any Google / Gmail account.
3. In the top bar, click the project dropdown and click **"New Project"** (e.g. name it `RideFlow-App`).
4. Navigate to **APIs & Services** > **Library**:
   - Search for **"Maps JavaScript API"** and click **Enable**.
   - Search for **"Routes API"** and click **Enable**.
   - Search for **"Places API (New)"** and click **Enable**.
   - Search for **"Geocoding API"** and click **Enable**.
5. Navigate to **APIs & Services** > **Credentials**:
   - Click **+ Create Credentials** > **API key**.
   - Copy your new API key (starts with `AIzaSy...`).
6. Paste your key into RideFlow:
   - In `apps/web/.env.local`:
     ```env
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here
     ```
   - In `apps/api/.env`:
     ```env
     GOOGLE_MAPS_SERVER_API_KEY=AIzaSy...your_key_here
     ```

---

## 3. Option C: Mapbox (Free Tier — 50,000 Loads/Month)

- **Cost**: Free up to 50,000 monthly map loads.
- **Sign-up**: [mapbox.com](https://www.mapbox.com/)
- **API Key format**: `pk.eyJ...`

---

## 4. Option D: Geoapify & LocationIQ (Free Routing & Geocoding)

- **Geoapify**: [geoapify.com](https://www.geoapify.com/) — 3,000 free geocodes/day without credit card.
- **LocationIQ**: [locationiq.com](https://locationiq.com/) — 5,000 free requests/day without credit card.
