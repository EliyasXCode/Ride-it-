# MongoDB Atlas & MongoDB Compass Setup Guide

This guide provides step-by-step instructions for connecting **RideFlow** to MongoDB Atlas (cloud) or local MongoDB, and inspecting schemas and indexes using MongoDB Compass.

---

## 1. Creating a MongoDB Atlas Free Cluster (M0 Sandbox)

1. Navigate to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign in or create an account.
2. Under your Project, click **Create** or **Build a Database**.
3. Select the **M0 Free Tier** (Shared cluster).
4. Choose your preferred Cloud Provider (e.g. AWS, GCP, or Azure) and select the region geographically closest to you.
5. Give your cluster a name (e.g., `rideflow-cluster`) and click **Create Cluster**.

---

## 2. Creating a Least-Privilege Database User

1. In the left navigation menu under **Security**, click **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: Select **Password**.
4. Set a username (e.g. `rideflow_app`) and generate a secure password.
5. Under **Database User Privileges**:
   - Instead of Atlas Admin, choose **Specific Privileges** -> **Add Built-In Role**.
   - Select `readWrite` on the specific database: `rideflow`.
   - This ensures the application only reads and writes to its own database.
6. Click **Add User**. Save your password securely.

---

## 3. Configuring Network Access (IP Access List)

1. In the left navigation under **Security**, click **Network Access**.
2. Click **Add IP Address**.
3. Recommended for development: Click **Add Current IP Address** to whitelist your local machine's external IP.
4. If testing across multiple dynamic IPs or in CI, you can temporarily allow access from anywhere (`0.0.0.0/0`), but configure an expiration time (e.g. 6 hours).
5. Click **Confirm**.

---

## 4. Obtaining the Connection URI

1. In the left navigation under **Deployment**, click **Database**.
2. Click the **Connect** button on your cluster card.
3. Choose **Drivers** (Node.js).
4. Copy the connection string format:
   ```text
   mongodb+srv://rideflow_app:<password>@rideflow-cluster.xxxx.mongodb.net/rideflow?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your database user password and ensure the database name `/rideflow` is specified before the query string.

---

## 5. Connecting the RideFlow Application

In `rideflow/apps/api/.env`:
```env
MONGODB_URI=mongodb+srv://rideflow_app:YOUR_SECURE_PASSWORD@rideflow-cluster.xxxx.mongodb.net/rideflow?retryWrites=true&w=majority
```
> **Security Warning:** Never commit `.env` or expose `MONGODB_URI` in client code.

---

## 6. Connecting MongoDB Compass

1. Download and install [MongoDB Compass](https://www.mongodb.com/try/download/compass).
2. Open Compass. In the **New Connection** screen, paste the exact same URI:
   ```text
   mongodb+srv://rideflow_app:<password>@rideflow-cluster.xxxx.mongodb.net/rideflow
   ```
3. Click **Connect**.
4. You will see the `rideflow` database in the left sidebar.

---

## 7. Inspecting Collections and Indexes

RideFlow manages the following indexed collections:
- `users` — Unique index on `email`.
- `driverprofiles` — Unique index on `userId`, `2dsphere` index on `currentLocation.coordinates`.
- `driverlocations` — `2dsphere` index on `location.coordinates` with geospatial querying and TTL index on `updatedAt`.
- `rides` — Compound index on `[riderId, status]`, `[driverId, status]`, and `[status, createdAt]`.
- `offers` — Unique compound index on `[rideId, driverId]`, TTL index on `expiresAt`.
- `farequotes` — TTL index on `expiresAt`.
- `payments` — Unique index on `idempotencyKey` and `providerTransactionId`.
- `scheduledrides` — Index on `scheduledFor` and `status`.

In Compass, click on any collection, switch to the **Indexes** tab to verify that `2dsphere` indexes and TTL indexes are active.
