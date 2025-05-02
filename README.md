# E‑Commerce - Frontend

This is the frontend e‑commerce web application. It is built using React.js and supports both regular users and administrators with features such as user registration, login, profile, admin panel, user management, and product management.

---

## Features

### User
- Register & login with JWT‑based authentication
- Profile view and update
- View product details (flavored & non‑flavored) with **alphabetically sorted** flavor selectors
- View related products on product detail page
- Deal badge with price strike‑through and discount info
- Product pagination, search, and category filtering
- **Add to Cart** functionality
  - Support for flavored and non‑flavored products
  - Quantity selector with purchase‑limit validation
  - Quantity updates synchronized with Redux
- **Checkout Page**
  - Place orders with automatic **quantity clamping** to available stock
  - Displays warnings if any quantities were adjusted
  - Responsive layout with pick‑up or delivery options
- **Cart Page**
  - View items with price & quantity breakdown
  - Inline quantity editing and remove buttons
  - Clear entire cart option
- **My Orders** page
  - Fetches orders with **paginated** API calls
  - Latest orders first, oldest last
  - **MUI Pagination** with ellipsis for large page counts
  - **Skeleton loading** and **error** states for robust UX
- **Order Details** page
  - View line items, totals, and shipping info
  - **Admin Actions**: update status, upload invoice, cancel order
  - Cancel restores stock and sold counts server‑side
  - Cancellation shows global warning alert

### Admin
- Login as admin
- View, edit, delete, and update stock of products
- Add new products (with image upload to AWS S3)
- Add flavored & non‑flavored products with individual price/stock
- Deal & discount management
- User management dashboard
  - Approve, reject, edit, and delete users
  - Email notifications on rejection
- **Order workflows**
  - Approve or reject order cancellations
  - Track order status through Processing, Ready, Delivered, etc.
  - Upload invoices and download links

### UI/UX
- Fully responsive layout (mobile/tablet/desktop)
- Mobile drawer navigation
- **Material UI (MUI)** design system
- **Global Snackbar Alerts** via Redux
  - Centralized in the `Layout` component
  - Survives route changes for consistent feedback
- **Skeleton** placeholders for loading states
- **Alert** components for error messages
- **MUI Pagination** with `siblingCount` & `boundaryCount` for ellipsis control
- Smooth image display with multiple views
- Horizontal scrollable related product section

---

## Tech Stack

- **React.js** – Component‑based frontend framework
- **Redux Toolkit** – Centralized state management
- **React Router** – Client‑side routing
- **Material UI (MUI)** – Modern UI component library
- **Axios** – API communication
- **jwt‑decode** – Decode JWT for role‑based access
- **AWS S3** – File storage for product images
- **Vercel** – Frontend hosting

---

## Upcoming Features

- Wishlist
- Admin and User dashboard analytics

---

## 👨‍💻 Maintained By

**Sai Krishna Mohan Kolla**  
Full Stack Developer – MERN | AWS | CI/CD