# ROLE
Act as a Principal Software Engineer and Product Designer with 15+ years of experience shipping production healthtech and on-demand delivery platforms (think Tata 1mg, PharmEasy, Swiggy Instamart). You write clean, modular, testable, secure code. You make deliberate architectural decisions, explain trade-offs briefly, and never ship placeholder or "lorem ipsum" quality work.

# PROJECT
Build "MediReach – Medicines, Closer to You": a full-stack web platform that connects customers with nearby medical stores for medicine ordering and delivery. Default location context: Yelahanka, Bengaluru, India (use INR, km, Indian phone format, and realistic local pharmacy data in seed content).

Core differentiator: if a delivery is delayed OR a medicine is unavailable at the selected store, the system automatically surfaces nearby alternative pharmacies (with live distance, ETA, and stock status) and shares their location on a map so the customer can still get the medicine quickly.

# OBJECTIVES (every one must map to a concrete feature)
1. Online medicine ordering and delivery platform: search, cart, checkout, order tracking.
2. Real-time medicine availability across nearby pharmacies (In Stock / Low Stock / Out of Stock).
3. Connect to nearby pharmacies when a medicine is unavailable at the selected store or delivery is delayed (map + ranked list).
4. Digital prescription handling: upload (image/PDF), pharmacist verification workflow, approval/rejection with reason.
5. AI-powered chatbot for basic medicine-related info and platform help (NOT medical diagnosis or dosage prescribing; show a clear disclaimer).
6. Pharmacy inventory management: stock quantity, manufacturing date, expiry date, price, batch number (CRUD + CSV import).
7. Expiry-date monitoring: dashboard alerts for items expiring in 30/60/90 days, expired items auto-flagged and hidden from customers.
8. Reduce time and effort: smart pharmacy ranking by (stock availability, distance, ETA, rating).
9. Centralized ecosystem: one platform with role-based portals for Customers, Pharmacy Owners, Delivery Partners, and Admin.

# USER ROLES & PORTALS
- Customer: location selection, search, categories (Prescription, OTC, Vitamins, Personal Care), cart, checkout, prescription upload, order history, live order tracking, AI chat, profile/addresses.
- Pharmacy Owner: inventory dashboard, incoming orders (accept/reject/prepare/dispatch), prescription verification queue, expiry alerts, low-stock alerts, sales summary.
- Delivery Partner: assigned deliveries, status updates, navigation link.
- Admin: approve/onboard pharmacies, monitor orders and delayed deliveries, basic analytics.

# CRITICAL FEATURE: DELAY / UNAVAILABILITY FALLBACK ENGINE
Design this as a standalone service module with unit tests:
- Trigger A: selected store has insufficient/zero stock for any cart item.
- Trigger B: order is not dispatched or delivered within the promised ETA window (configurable threshold, e.g. ETA + 10 min).
- Logic: query pharmacies within a configurable radius (default 5 km) using Haversine/PostGIS, filter by stock of the requested items and non-expired batches, rank by weighted score (stock match, distance, ETA, rating), return top N.
- UX: show a non-intrusive banner/bottom sheet: "Running late? These nearby pharmacies have your medicines in stock", with a map (pins, distance, ETA, call button, "Switch order to this store" button).
- Notify the customer (in-app notification + simulated SMS/email hook).

# RECOMMENDED TECH STACK (justify any deviation in the plan)
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion (subtle only) + TanStack Query + React Hook Form + Zod
- Backend: Next.js API routes / server actions (or NestJS if you recommend a separated service), REST with OpenAPI-style docs
- Database: PostgreSQL (Supabase or Prisma + Postgres) with proper relations, indexes, and migrations
- Auth: JWT/session-based auth with role-based access control (RBAC) and protected routes
- Maps: Leaflet + OpenStreetMap (no paid API key required)
- Realtime: Supabase Realtime or WebSockets/SSE for order status and stock updates
- File storage: prescriptions in private storage bucket with signed URLs
- AI chatbot: Gemini API behind a server-side route (never expose keys client-side), with a restrictive system prompt: general medicine information, platform help, no diagnosis, no dosage advice, always advise consulting a doctor/pharmacist
- Testing: Vitest/Jest for logic, Playwright for 2-3 critical user flows

# DATA MODEL (design properly, then show an ER summary)
Users, Roles, Pharmacies, Medicines (catalog), InventoryBatches (pharmacy_id, medicine_id, batch_no, qty, mfg_date, expiry_date, price), Carts/CartItems, Orders/OrderItems, OrderStatusHistory, Prescriptions (status, verified_by, reason), DeliveryAssignments, Addresses, Notifications, ChatSessions, Reviews. Add indexes for geo queries, medicine search, and expiry date.

# UI / UX REQUIREMENTS
Visual identity: clean, trustworthy, modern healthcare feel.
- Palette: primary healthcare green (#16A34A family) with soft mint backgrounds (#F0FDF4), white cards, slate text; use red only for alerts/out-of-stock, amber for low stock/expiring-soon.
- Typography: Inter or Plus Jakarta Sans; clear hierarchy; generous whitespace.
- Rounded cards (rounded-2xl), soft shadows, consistent 8px spacing grid, subtle micro-interactions.
- Mobile-first and fully responsive (customer side should feel like the mobile app mockup: location header, search bar, category chips, "Quick Delivery" banner, "Nearby Pharmacies" cards with rating, distance, ETA, In-Stock badge, bottom navigation on mobile).
- Desktop: clean top navbar, split layouts for map + list, data tables with filters for pharmacy dashboards.
- Stock/expiry status always shown with color + icon + text (not color alone).
- Skeleton loaders, empty states, error states, and toasts for every async flow.
- Accessibility: WCAG AA contrast, keyboard navigation, aria labels, focus rings.
- Light mode first; structure tokens so dark mode can be added later.
- Landing page: hero with value proposition, how-it-works (3 steps), key features, delay-fallback explanation, CTA for customers and pharmacies.

# ENGINEERING STANDARDS
- Clean architecture: feature-based folder structure, separation of UI / services / data-access, no business logic in components.
- Strict TypeScript, Zod validation on all inputs (client + server), centralized error handling.
- Security: hashed passwords, RBAC on every route, rate limiting on auth and chat, file type/size validation for prescriptions, no secrets in client code, .env.example provided.
- Medical/legal safety: prescription-only medicines cannot be checked out without an approved prescription; show disclaimers; log verification actions for audit.
- Performance: pagination, debounced search, optimized images, memoized map markers.
- Seed script with realistic data: ~8 Yelahanka-area pharmacies, ~60 medicines (e.g., Paracetamol 500mg, Crocin Advance, Azithromycin 500mg), batches with varied expiry dates, sample users per role, and a demo scenario that triggers the delay fallback.
- Meaningful commit-style task breakdown, comments only where logic is non-obvious.

# WORKFLOW (follow strictly)
1. PLAN FIRST: produce an implementation plan artifact covering architecture, folder structure, DB schema, API list, page map, and phased milestones. Wait for my approval before coding.
2. Build in phases: (a) project setup + design system + auth/RBAC, (b) DB + seed + medicine search + availability, (c) cart/checkout/orders + tracking, (d) pharmacy dashboard + inventory + expiry monitoring, (e) prescription flow, (f) fallback engine + maps, (g) AI chatbot, (h) delivery + admin portals, (i) polish, tests, README.
3. After each phase: run the app, verify it works in the browser, fix errors, and summarize what was done and what's next.
4. Finish with a README (setup, env vars, architecture diagram, demo credentials, demo script that walks through the delay-fallback scenario) and a list of known limitations / future scope (real payment gateway, SMS gateway, live GPS rider tracking, ML-based demand prediction).

# DEFINITION OF DONE
The app runs locally with one setup command, all 9 objectives are demonstrable end-to-end, there are no console errors, UI is responsive from 360px to 1440px, and the delay-fallback demo works reliably.

Start by asking up to 3 clarifying questions only if truly blocking; otherwise proceed directly to the implementation plan.