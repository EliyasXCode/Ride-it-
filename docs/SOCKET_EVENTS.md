# RideFlow Realtime WebSockets & State Machine

RideFlow utilizes Socket.IO for bidirectional, event-driven communication between Riders, Drivers, and the authoritative backend.

---

## 1. Authoritative Ride State Machine

```
[requested]
     │
     ▼
[searching] ──(No drivers/Expired)──► [no_drivers]
     │
     ▼ (Driver accepts offer)
 [assigned]  ──(Cancelled)──► [cancelled]
     │
     ▼ (Driver clicks Arrived)
  [arriving]
     │
     ▼
  [arrived]
     │
     ▼ (Server verifies 4-digit PIN)
[in_progress]
     │
     ▼ (Driver clicks Complete)
[completed]
```

---

## 2. Real-Time Socket Events

### Connection & Authentication
Socket.IO connection initiates at `/socket.io`. The backend parses and verifies the session cookie or handshake token.

### Rooms:
- `user:<userId>` — Personal notification channel
- `ride:<rideId>` — Dedicated room for authorized participants (rider, assigned driver, admin)

### Client to Server Events:
| Event | Payload | Description |
|---|---|---|
| `join_user_room` | `{ userId }` | Authenticated client joins personal notification room |
| `join_ride_room` | `{ rideId }` | Rider or driver joins active ride room |
| `leave_ride_room` | `{ rideId }` | Client leaves active ride room |
| `driver:update_location` | `{ lat, lng, heading }` | Online driver streams GPS updates (throttled) |
| `driver:respond_offer` | `{ rideId, accept: boolean }` | Driver responds to incoming ride offer dispatch |
| `trip:send_message` | `{ rideId, text }` | Rider or driver sends in-trip text message |

### Server to Client Events:
| Event | Payload | Description |
|---|---|---|
| `ride:offer_dispatched` | `{ rideId, pickup, dropoff, fareMinor, expiresAt }` | Sent to candidate driver with 15s countdown |
| `ride:status_updated` | `{ rideId, status, ride }` | Broadcast to `ride:<rideId>` room upon state change |
| `driver:location_updated` | `{ rideId, lat, lng, heading }` | Forwarded to rider tracking screen |
| `trip:message_received` | `{ message: TripMessage }` | Forwarded to other participant in ride room |
| `ride:cancelled` | `{ rideId, reason, cancelledBy }` | Sent if rider, driver, or system cancels |
| `system:notification` | `{ title, message, type }` | In-app notification toast |
