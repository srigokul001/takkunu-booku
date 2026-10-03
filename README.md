# 🏨 TAKKUNU BOOKU — Find. Book. Stay. | Hotel Room Booking System

A modern, clean, beginner-friendly **Hotel Room Booking System** built with **React (Vite), Tailwind CSS, Node.js, Express, MongoDB (Mongoose), JWT, and bcrypt**.

---

## 🌐 Localhost URLs

The application is actively running locally on:

- **Frontend Web Application (Customer & Admin):** [http://localhost:3000](http://localhost:3000)
- **Backend REST API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Login Credentials

The database has been pre-seeded with realistic hotels, luxury suites, users, and reservations. Quick 1-click auto-fill buttons are also available on both login pages!

| Account Type | Email | Password | Role | Access / Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@hotelbooking.com` | `adminpassword123` | `Admin` | Full access to Admin Dashboard, Manage Hotels, Rooms, Users & Bookings |
| **Customer 1** | `john@example.com` | `johnpassword123` | `User` | Customer booking history, room reservation, profile management |
| **Customer 2** | `sarah@example.com` | `sarahpassword123` | `User` | Customer booking history, room reservation, profile management |

---

## 📦 Project Architecture & The 4 Modules

```text
hotel-booking-system/
│
├── frontend/                     # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # Navbar, Footer, HotelCard, RoomCard, SearchBar, ProtectedRoute, etc.
│   │   ├── pages/                # Home, Hotels, HotelDetails, RoomDetails, Booking, Payment, Profile, etc.
│   │   │   └── admin/            # AdminDashboard, ManageHotels, ManageRooms, ManageUsers, ManageBookings
│   │   ├── layouts/              # MainLayout, AdminLayout
│   │   ├── services/             # Axios API services (auth, hotel, room, booking, admin)
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── hooks/                # useAuth, useToast
│   │   ├── App.jsx               # React Router route registry
│   │   └── main.jsx
│   └── package.json
│
└── backend/                      # Node.js + Express + MongoDB
    ├── config/                   # db.js (MongoDB + auto in-memory fallback), seed.js
    ├── controllers/              # authController, hotelController, roomController, bookingController, adminController
    ├── models/                   # User, Hotel, Room, Booking, Payment (5 collections)
    ├── routes/                   # authRoutes, hotelRoutes, roomRoutes, bookingRoutes, adminRoutes
    ├── middleware/               # authMiddleware (JWT + roles), errorMiddleware
    ├── server.js                 # Express server entry point
    ├── .env                      # Environment config
    └── package.json
```

### Module Breakdown:

1. **Module 1 — User & Authentication:**
   - Registration, Login, Logout with JWT and bcrypt password encryption.
   - Profile view, Profile update (name, phone, email, password change).
   - Customer booking history view.
   - Role-based authorization (`User` vs `Admin`).

2. **Module 2 — Hotel & Room Management:**
   - Browse hotels with live search by city / destination keyword.
   - Detailed hotel profile with high-res photography, amenities, and contact info.
   - Room filtering by room type (`Single`, `Double`, `Deluxe`, `Suite`, `Family Suite`, `Executive Suite`) and max nightly price.
   - **Date availability check**: Checks conflicting bookings and prevents overlapping reservations.

3. **Module 3 — Booking & Dummy Payment:**
   - Check-in & check-out date picker with automatic night calculation.
   - Primary guest contact form and special requests.
   - **Automatic price calculation:** `Total Price = Number of Nights × Room Price`.
   - **Dummy Payment System:** Supports Credit/Debit Card (with instant 1-click test fill), UPI/QR, Net Banking, and Pay at Hotel.
   - Unique readable Booking ID generator (e.g. `BK-92761571`).
   - Printable digital reservation voucher and receipt.
   - Customer self-service booking cancellation with instant simulated refund.

4. **Module 4 — Admin Management:**
   - Dedicated Admin Dashboard with metrics:
     - Total Hotels
     - Total Rooms
     - Total Users
     - Total Bookings
     - Total Revenue
     - Booking status breakdown chart
     - Recent bookings feed
   - **Hotel Management:** Add hotel, Edit hotel, Delete hotel.
   - **Room Management:** Add room, Edit room, Delete room, One-click Room Availability toggle.
   - **Booking Management:** View all bookings, filter by status, search by Booking ID, Confirm / Cancel actions.
   - **User Management:** View registered users, view individual user booking histories.

---

## 🚀 How to Run Backend & Frontend Locally

### 1. Prerequisites
- Node.js (v18+)
- (Optional) Local MongoDB or MongoDB Atlas URI. *Note: If MongoDB is not installed locally, the backend automatically connects to an in-memory database with zero configuration required!*

### 2. Backend Setup & Run
```bash
cd backend

# Install dependencies
npm install

# Start backend server (runs on http://localhost:5000)
npm start

# Or run with auto-reload (development mode)
npm run dev

# Re-seed test data at any time
npm run seed
```

### 3. Frontend Setup & Run
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build
```

---

## ⚙️ Environment Configuration (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hotel_booking
JWT_SECRET=hotel_booking_secret_key_jwt_2026_super_secure
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## 📡 Complete REST API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Login & receive JWT token |
| `GET` | `/api/auth/profile` | Private | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user profile / password |
| `GET` | `/api/auth/bookings` | Private | Get user's personal booking history |

### 🏨 Hotels (`/api/hotels`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/hotels` | Public | Get all hotels (optional `?location=` or `?search=`) |
| `GET` | `/api/hotels/:id` | Public | Get hotel details + all rooms belonging to hotel |
| `POST` | `/api/hotels` | Admin | Create a new hotel property |
| `PUT` | `/api/hotels/:id` | Admin | Update hotel details |
| `DELETE`| `/api/hotels/:id` | Admin | Delete hotel and associated rooms |

### 🛏️ Rooms (`/api/rooms`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rooms` | Public | Get rooms (filter by `hotelId`, `roomType`, `checkIn`, `checkOut`, `minPrice`, `maxPrice`) |
| `GET` | `/api/rooms/:id` | Public | Get single room details |
| `GET` | `/api/rooms/:id/availability` | Public | Check room date availability (`?checkIn=&checkOut=`) |
| `POST` | `/api/rooms` | Admin | Add new room |
| `PUT` | `/api/rooms/:id` | Admin | Update room |
| `DELETE`| `/api/rooms/:id` | Admin | Delete room |

### 📅 Bookings & Payments (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Private | Create booking & process dummy payment |
| `GET` | `/api/bookings/:id` | Private | Get booking details by ID or `bookingId` |
| `PUT` | `/api/bookings/:id/cancel` | Private | Cancel booking and refund dummy payment |

### 🛡️ Admin Console (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | Total Hotels, Rooms, Users, Bookings, Revenue & stats |
| `GET` | `/api/admin/bookings` | Admin | Get all system bookings (with filters) |
| `PUT` | `/api/admin/bookings/:id/status`| Admin | Update status (Confirm/Cancel) |
| `GET` | `/api/admin/users` | Admin | List all registered users |
| `GET` | `/api/admin/users/:id/bookings`| Admin | View specific user's reservations |
| `PATCH`| `/api/admin/rooms/:id/toggle-status`| Admin | Instant toggle room availability |
