# E-Commerce - Frontend

This is frontend e-commerce web application. It is built using React.js and supports both regular users and administrators with features such as user registration, login, profile, admin panel, user management, and product management.

---

## Features

### User
- Register & login with JWT-based authentication
- Profile view and update
- View product details (flavored & non-flavored)
- View related products on product detail page
- Deal badge with price strike-through and discount info
- Product pagination, search, and category filtering
- **Add to Cart functionality**
  - Support for flavored and non-flavored products
  - Quantity selector with purchase limit validation
  - Quantity updates for performance
- **Cart Page**
  - View items with price & quantity breakdown
  - Inline quantity editing and remove buttons
  - Clear entire cart option
  - Pick-up or delivery selection before placing order
- Responsive design with mobile support
- Snackbar notifications for user feedback

### Admin
- Login as admin
- View, edit, delete, update stock of products
- Add new products (with image upload to AWS S3)
- Add flavored & non-flavored products
- Inline stock updates (flavor-aware)
- Deal & discount management
- User management dashboard
  - Approve, reject, edit, and delete users
  - Email notifications on rejection

### UI/UX
- Fully responsive layout (mobile/tablet/desktop)
- Mobile drawer navigation
- Material UI (MUI) design system
- Snackbar alerts with auto-dismiss
- Loading spinners & interactive modals
- Smooth image display with zoom and multiple views
- Horizontal scrollable related product section

---

## Tech Stack

- **React.js** - Component-based frontend framework
- **Redux Toolkit** - Centralized state management
- **React Router** - Client-side routing
- **Material UI (MUI)** - Modern UI component library 
- **Axios** - API communication
- **jwt-decode** - Decode JWT for role-based access
- **AWS S3** - File storage backend for product images
- **Vercel** - For frontend hosting

---

## Upcoming Features

- Wishlist and order tracking
- Invoice upload and management for completed orders
- Admin dashboard analytics

---

## 👨‍💻 Maintained By

**Sai Krishna Mohan Kolla**  
Full Stack Developer – MERN | AWS | CI/CD