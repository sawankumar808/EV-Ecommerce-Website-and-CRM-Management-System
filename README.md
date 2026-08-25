# EV CRM Frontend (React + Vite + Tailwind)

Green EV-themed frontend for the Django backend (`../backend`). Contains **three surfaces**
in one app, matching the requirement document exactly:

1. **Public E-commerce Website** — `/`, `/about`, `/products`, `/products/:id`, `/contact`, `/terms`, `/privacy`
   Prices are hidden ("Login to View Price") until an approved vendor logs in.
2. **Vendor Portal** — `/vendor/register` (public signup) and `/vendor-dashboard` (after login):
   vendor status, own orders/batteries/customers/scooters stats, product pricing, recent activity.
3. **CRM Admin / Sales** — everything under `/crm/*`: Dashboard, Vendors, Sales Pipeline (Kanban),
   Sales Team (performance leaderboard), Customers (+ full detail/history page), Coupons, Products,
   Batteries (batch generation + QR), Scooters, Quotations.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Opens at http://localhost:5173.

- **Admin login:** `admin / Admin@123` → redirects to `/crm`
- **Vendor:** register at `/vendor/register`, log in after CRM Admin approval → redirects to `/vendor-dashboard`

## Routing map

| Path | Who | Page |
|---|---|---|
| `/` `/about` `/products` `/products/:id` `/contact` `/terms` `/privacy` | Anyone | Public e-commerce site |
| `/vendor/register` | Anyone | Vendor self-registration |
| `/login` | Anyone | Shared login (routes by role after auth) |
| `/vendor-dashboard` | Vendor role | Vendor's own dashboard |
| `/crm` `/crm/vendors` `/crm/leads` `/crm/sales-team` `/crm/customers` `/crm/customers/:id` `/crm/coupons` `/crm/products` `/crm/batteries` `/crm/scooters` `/crm/quotations` | Admin / Sales role | CRM Admin panel |

## Design system

- Palette: ink `#0B1512` (dark surfaces/nav), volt `#B6FF3C` (primary accent), emerald `#1FAA59` (actions), surface `#F5F7F3` (page bg), amber/coral for pending/danger states.
- Type: Space Grotesk (display), Inter (body), JetBrains Mono (IDs, serials, GST numbers, coupon codes).
- Signature element: the **charge-bar** (`.charge-bar` in `index.css`) — a battery-charge-style gradient bar reused across KPI cards, batch progress and leaderboard bars.

## Next steps

- Cart/Order flow on the public site (structure is ready — hook into a new `Order` model)
- Vendor document upload UI (backend `VendorDocument` model + endpoint already exist)
- Forgot Password flow
