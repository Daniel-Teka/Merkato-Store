# MERKATO — Professional Full-Stack eCommerce Sourcing Marketplace

MERKATO is a professional full-stack eCommerce marketplace inspired by Africa's largest open-air market, connecting rich traditional Ethiopian specialties (single-origin Highland coffees, handwoven cotton apparel, Bole genuine leather) alongside flagship global consumer technology.

This project features a production-grade React frontend paired with an Express/Node.js monolithic backend, durable JSON-based database modeling, high-fidelity real-time server-sent events (SSE), background inventory cron alerts, and intelligent shopping curation powered by Gemini 3.5.

---

## Technical Highlights & Features

### 💻 Frontend Architecture (React + Vite + Tailwind CSS v4)
- **High-Fidelity UI**: Clean modular layout using Inter typography, Space Grotesk display headings, and JetBrains Mono for monetary values.
- **Dynamic Orchestration**: Fully controlled view router (`home`, `products`, `product-details`, `cart`, `wishlist`, `dashboard`, `admin`, `about`, `contact`).
- **AI Matching Panel**: Connects to server-side Gemini endpoints, presenting prompt recommendation chips and explaining why specific items were curated for you.
- **Commercial Checkout**: Computes 15% VAT, delivery fee thresholds (Free above 15,000 ETB), and validates promotional coupon codes. Includes a high-fidelity Telebirr and Chapa payment gateway sandbox generating official printable QR code-stamped invoices.
- **Order Tracking Stepper**: Interactive delivery progress timelines (Pending, Processing, Shipped, Delivered) reflecting direct database updates.

### ⚙️ Monolithic Backend Architecture (Express + Node.js)
- **Secure Authentication**: Crypto-based secure password hashing (using SHA-256 and salt), generating JWT-signed auth tokens stored securely.
- **Database Synchronization**: Durable CRUD data storage managing 42 seed products, user lists, active message logs, and notification caches.
- **SSE Real-Time Broadcasts**: Continuous streaming alerts sent dynamically from server to browser, notifying standard shoppers of item stock depletions or new orders.
- **Background Cron Services**: Simulates persistent schedule loops running every 60 seconds to scan catalog stocks and generate high-priority administrative alarms.
- **Gemini AI Integration**: Uses server-side `@google/genai` to parse catalog specifications and return structured, curated recommendation lists.

---

## Sourcing Structure & Directory Map
```
/
├── server.ts               # Full-Stack Express Server with API endpoints & SSE
├── server_db.json          # Persistent Local DB (Users, Products, Orders, Alarms)
├── package.json            # Scripts, Dev tools, esbuild compilers & production starts
├── tsconfig.json           # Master TypeScript compiler structures
├── src/
│   ├── App.tsx             # App Core state coordinator & SSE event listener
│   ├── main.tsx            # Main React Entry Point
│   ├── types.ts            # Client-Server TypeScript models (Order, Review, Product)
│   ├── api.ts              # Fetch proxies with integrated JWT auth headers
│   ├── index.css           # Google Fonts imports and Tailwind CSS theme layers
│   └── components/
│       ├── Navbar.tsx      # Sticky Navigation header with live Notification drop
│       ├── Footer.tsx      # Responsive Footer & Newsletter submit cards
│       ├── Hero.tsx        # Animated promotional slideshow
│       ├── ProductCard.tsx # Reusable item rating, discount tags & stock warns
│       ├── ProductDetails.tsx # Detailed gallery, spec sheets & write review panels
│       ├── CartView.tsx    # Shopping Cart, coupon codes & Telebirr payment portals
│       ├── WishlistView.tsx # Quick Wishlist saves
│       ├── UserDashboard.tsx # Customer Order Steppers & Printable QR Invoices
│       ├── AdminDashboard.tsx # Revenue analytics, SVG graphs & CRUD catalog models
│       └── LoginRegister.tsx # Auth form toggler & pre-filled Demo Testing logins
└── documentation/
    └── ARCHITECTURE.md     # In-depth server endpoints & data diagrams
```

---

## Launch & Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Boot Development Environment** (Port 3000):
   ```bash
   npm run dev
   ```

3. **Build & Bundling for Production**:
   ```bash
   npm run build
   ```

4. **Production Start**:
   ```bash
   npm run start
   ```

---

## Pre-filled Testing Credentials

To test administrative metrics or standard shopper journeys instantly without manually registering, use our **Fast-Track Testing buttons** on the Login screen, or enter:
- **Shopper Account**: `customer@merkato.com` / `password123`
- **Admin Account**: `admin@merkato.com` / `password123`
