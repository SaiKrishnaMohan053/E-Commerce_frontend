# E-Commerce Frontend

This is the frontend e-commerce web application. It is built using React.js and supports both regular users and administrators with features such as user registration/login, profile management, a full admin panel (user & product management, order workflows, analytics), shopping cart & checkout, order history, wishlist/favorites—and now integrated restock alerts.

---

## Features

### User

* **Authentication & Profile**
  * Register & login with JWT-based authentication
  * Profile view & update
* **Dynamic Categories Menu**
  * Fetched categories & subcategories from backend API (`getCategories` controller)
  * Displayed icons per category (from S3 imageUrl or default mapping)
  * Horizontally scrollable menu with accessible keyboard/ARIA support
* **Product Browsing**
  * View product details (flavored & non-flavored) with **alphabetically sorted** flavor selectors
  * View related products on product detail page (horizontal scroll)
  * Deal badge with price strike-through & discount info
  * Product pagination, search, and category filtering
* **Cart & Checkout**
  * **Add to Cart** (flavor-aware, purchase-limit enforced)
  * Quantity selector in-line or by typing
  * **Global Snackbar Alerts** via Redux—survive route changes
  * **Cart Page**
    * View items with price & quantity breakdown
    * Inline quantity editing & remove buttons
    * Clear entire cart option
  * **Checkout Page**
    * Place orders with **quantity clamping** to available stock
    * Displays warnings if any quantities were adjusted
    * Responsive layout with pick-up or delivery options
* **Orders**
  * **My Orders** page
    * Fetches orders with paginated API calls
    * Latest first, oldest last
    * **MUI Pagination** with `siblingCount` & `boundaryCount` (ellipsis)
    * **Skeleton** loading & **Alert** error states
  * **Order Details** page
    * View line items, totals, shipping info
    * **Admin Actions**: update status, upload invoice, cancel order
    * Cancel restores stock & sold counts server-side

### Wishlist / Favorites

* **Wishlist Page**
  * Add/remove favorites from product cards or cart
  * List layout matching cart style, responsive for mobile/tablet/desktop
  * Move items between wishlist & cart with a single click

### User Dashboard
  * User Dashboard with Top Sellers, Deals, and New Arrivals sections
  * Horizontal, scrollable **See More** cards that expand to show all items
  * `userDashboardSlice` in Redux for fetching combined dashboard data
  * `MiniProductCard` component supporting deals, dynamic prices, and conditional price display for logged‐in users
  * `AdsCarousel` component:
    - One‐slide‐per‐screen carousel with peek of next slide
    - Automatic sliding and manual arrows

### Admin

* **Login as Admin**
* **Product Management**
  * Create / Read / Update / Delete products (with image upload to AWS S3)
  * Flavored & non-flavored products with individual price/stock
  * Deal & discount management
* **User Management**
  * Clickable rows triggering a dialog showing store, owner, email, phone, address details
  * Approve/reject users, view/edit/delete users
  * Email notifications on approval or rejection
* **Order Workflows**
  * View all orders with pagination
  * Approve or reject order cancellations
  * Track status: Processing → Ready → Delivered → Picked Up → Cancelled
  * Upload invoices & download links

#### Admin Analytics & Reporting

* Consolidated daily, weekly, monthly, yearly, and custom‐range sales summary in a unified chart
* Export to Excel with shared `exportXlsx()` utility and dynamic meta rows
* Order trends and status‐breakdown charts integrated (line + pie charts)
* Color‐mapped status breakdown using MUI theme palettes
* `makeDateRange()` for period calculations
* `exportXlsx()` helper for all Excel exports (summary, category reports)
* Single `DateRangeBox` component handling both summary & category custom ranges

#### Advertisement Management

* **Admin Ads Page** (`/admin/ads`)
  * Create, edit, and delete “poster” or “flyer” ads
  * Upload images/PDFs (stored in S3 via backend)  
  * Specify optional **link**, **startDate**, **endDate**
  * Desktop & mobile table views with inline edit & delete  
* **`useAds` Hook**
  * Fetches `/api/admin/getAds` for current active ads
* **`AdCarousel` Component**
  * Displays active ads on user‐facing pages
  * Automatically rotates through images
  * Respects start/end dates

#### Product Cards & Restock Alerts

* **Restock Indicators** (Admin only)
  * Each card border turns **green** (fast), **yellow** (average), or **red** (slow) based on `/api/admin/restock-alerts`
* **Inline Restock Details**
  * Non-flavored products: show **Avg Weekly Sold**, **Reorder Point**, **Velocity** below card
  * Flavored products: show a **Flavor ▼** dropdown; upon selection, displays that flavor’s Avg Weekly, Reorder Point & Velocity side-by-side
* **`useRestockAlerts` Hook**
  * Fetches restock metrics once on page load (admin only)
  * Provides a map from `productId → { velocity, avgWeekly, reorderPoint, flavorMetrics… }`

### UI/UX

* Fully responsive layout (mobile/tablet/desktop)
* Mobile drawer navigation
* **Material UI (MUI)** design system
* **Global Snackbar Alerts** via Redux in a centralized `Layout`
* **Skeleton** placeholders for loading states
* **Alert** components for errors
* Smooth image display with zoom & multiple views
* Horizontal scrollable related products

---

## Tech Stack

* **React.js** – Component-based frontend
* **Redux Toolkit** – Centralized state management
* **React Router** – Client-side routing
* **Material UI (MUI)** – UI component library
* **Axios** – API communication
* **jwt-decode** – Decode JWT for role-based UI
* **AWS S3** – File storage for product & ad images
* **Vercel** – Frontend hosting

---

## Environment Variables

Define in a `.env` at project root:

```env
REACT_APP_API_BASE_URL=https://your-backend.example.com
```

---

## Deployment

* Hosted on **Vercel**
* Auto-deploy from `main` branch on Git push

---

## Maintained By

**Sai Krishna Mohan Kolla**  
Full Stack Developer – MERN | AWS | CI/CD