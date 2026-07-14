# MERKATO — System Sourcing Architecture

This document details the high-fidelity internal design of the **MERKATO** marketplace, including database structures, Express API routes, real-time mechanisms, and server-side AI prompt curation.

---

## 1. Database Model Schema (`/server_db.json`)

The server uses a modular local JSON store, guaranteeing persistent storage. The data models map directly to:

- `users`: Standard shoppers and administrative operator accounts.
- `products`: 42 items complete with category, price (ETB), discount, available stock, user star reviews, and specification matrices.
- `orders`: Shopping baskets with calculated VAT (15%), delivery fees, payment channels, and active stepper status.
- `messages`: Inquiry mail forms submitted by external visitors.
- `notifications`: Stock warnings and order events broadcasted in real time.

---

## 2. Express Backend API Routes

### 🔐 Authentication (`/api/auth/*`)
- `POST /api/auth/register` - Registers a new shopper, hashing passwords with salt, and issues a standard JWT.
- `POST /api/auth/login` - Authenticates credentials, returning signed authorization tokens.
- `GET /api/auth/me` - Verifies bearer token, returning active user profile records.

### 📦 Products Catalog (`/api/products/*`)
- `GET /api/products` - Returns a paginated grid of 14 items per page. Supports filtering by search keyword, category, and sorting.
- `GET /api/products/:id` - Returns detailed product specifications, reviews, and highly related recommendations.
- `POST /api/products` - Admin-only route to publish new items.
- `PUT /api/products/:id` - Admin-only route to update stocks, pricing, or specifications.
- `DELETE /api/products/:id` - Admin-only route to remove items.
- `POST /api/products/:id/review` - Authenticated route to post star ratings and customer reviews.

### 🛒 Orders & Checkout (`/api/orders/*`)
- `GET /api/orders` - Fetches orders. Customers view their own logs, while Admins receive the entire master pipeline.
- `POST /api/orders` - Processes carts. Deducts product stock levels, verifies discounts, and appends unique order IDs.
- `PUT /api/orders/:id` - Updates order status (e.g. Processing, Shipped, Delivered) and logs tracking milestones.

### 🔔 Notifications & Real-Time Alerts
- `GET /api/notifications` - Fetches historical notifications.
- `POST /api/notifications/read/:id` - Marks a specific notification as read.
- `POST /api/notifications/read-all` - Clears entire unread list.

### 📊 Administrative Statistics
- `GET /api/dashboard/stats` - Compiles total revenue, order count, product count, user registrations, low-stock depletions, and daily sales curve points.

---

## 3. Real-Time SSE Streams & Background Cron Job

### SSE Event Stream (`GET /api/events`)
 Shoppers and Admin dashboards maintain an active Server-Sent Events (SSE) connection. Upon loading, the server transmits:
1. `initial_notifs`: Historical alarms.
2. `low_stock_broadcast`: Sent instantly whenever an item's stock drops below 5.
3. `new_order_broadcast`: Sent instantly whenever a customer completes checkout.

### Simulated background Cron
A server-side `setInterval` cycle executes every 60 seconds. It scans the database products catalog, identifies items whose inventory levels have fallen below 5, creates matching `low_stock` notifications, and broadcasts them immediately to all connected browsers.

---

## 4. Server-Side Gemini AI Integration (`POST /api/gemini/recommendations`)

When a user submits a shopping curation query (or triggers quick chips), the Express server acts as a secure proxy:
1. Validates the incoming query and user preferences.
2. Formulates a system-instructed prompt for the `gemini-3.5-flash` model.
3. Instructs Gemini to return a structured JSON response consisting of matched items from the catalog along with a brief, personalized welcome message and a customized reason for matching each item.
4. Returns the validated JSON to the React client, ensuring no private API keys are ever leaked to the browser.
