# 🎬 Savannah Cinemas

A modern cinema booking platform built for **Savannah Cinemas**, designed to provide users with a seamless experience for discovering movies, viewing showtimes, selecting seats, booking tickets, and managing their bookings.

The project combines a responsive web frontend with a Node.js/Express backend and a relational database to handle authentication, movies, cinemas, showtimes, seats, bookings, reviews, and related cinema operations.

---

## 📸 Overview

Savannah Cinemas is a full-stack cinema management and ticket-booking system designed around a modern cinema experience.

Users can:

* 🎥 Browse currently available and upcoming movies
* 🔎 View movie details
* 🕐 Browse available showtimes
* 💺 Select seats interactively
* 🍿 Add optional snacks to their booking
* 🎟️ Complete a cinema booking
* 📱 Access booking information and QR codes
* ⭐ Write and manage movie reviews
* ❤️ Maintain a watchlist
* 👤 Create and manage an account
* 📋 View previous and upcoming bookings

The platform is being developed with scalability in mind so it can eventually support multiple cinema locations, screens, showtimes, and additional customer features.

---

## ✨ Features

### 🎬 Movie Discovery

* Featured movie carousel
* Now Showing movies
* Upcoming movies
* Movie details
* Genres and movie metadata
* Movie posters and backdrops
* Movie enrichment using external movie data
* Movie status management

### 🎟️ Booking System

The booking flow is designed to guide users through the complete ticket-purchasing experience:

```text
Movie
  ↓
Movie Details
  ↓
Showtimes
  ↓
Seat Selection
  ↓
Optional Snacks
  ↓
Booking Summary
  ↓
Payment
  ↓
Booking Confirmation
  ↓
QR Code
```

### 💺 Seat Selection

Users can:

* View available seats
* Select multiple seats
* See unavailable seats
* Review selected seats
* Calculate ticket totals
* Continue to checkout

### 🍿 Snacks

The platform supports optional snack purchases as part of the booking process.

Examples include:

* Popcorn
* Drinks
* Cinema snacks
* Other concessions

### 👤 Authentication

The application includes user authentication functionality for:

* Registration
* Login
* Authentication tokens
* Protected API endpoints
* User-specific bookings
* User-specific reviews
* Account information

### ⭐ Reviews

Authenticated users can submit movie reviews.

The review system supports:

* Creating reviews
* Viewing reviews
* Managing user reviews
* Authentication checks

### ❤️ Watchlist

Users can save movies they are interested in and manage their personal watchlist.

The frontend currently uses browser storage for watchlist functionality.

### 📱 My Bookings

Users can view their bookings and access relevant booking information, including confirmation details and QR codes.

---

# 🏗️ Architecture

The project follows a client-server architecture.

```text
┌──────────────────────────┐
│       Frontend           │
│                          │
│ HTML / CSS / JavaScript  │
└────────────┬─────────────┘
             │
             │ HTTP / REST API
             ▼
┌──────────────────────────┐
│       Backend            │
│                          │
│ Node.js + Express        │
│ Authentication           │
│ Business Logic           │
│ API Routes               │
└────────────┬─────────────┘
             │
             │ Database Queries
             ▼
┌──────────────────────────┐
│        Database          │
│                          │
│ Oracle / PostgreSQL      │
└──────────────────────────┘
```

The frontend does **not** connect directly to the database.

Instead:

```text
Browser → Express API → Database
```

This keeps database credentials and database operations on the server.

---

# 🛠️ Tech Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* Responsive Web Design
* LocalStorage
* Fetch API

## Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* CORS
* Nodemailer
* Environment Variables

## Database

The project has been developed around a relational database architecture.

Current database technologies used during development include:

* Oracle Database
* PostgreSQL

Database functionality includes:

* Users
* Movies
* Reviews
* Showtimes
* Screens
* Seats
* Bookings
* Booking details
* Snacks
* Cinema data

## External Services

The application can integrate with external movie data services to enrich movie information.

---

# 📂 Project Structure

A simplified version of the project structure is:

```text
savannah-cinemas/
│
├── index.html
├── config.js
│
├── css/
│   ├── style.css
│   └── ...
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── booking.js
│   ├── movies.js
│   └── ...
│
├── images/
│   └── ...
│
├── server/
│   │
│   ├── server.js
│   │
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── bookingController.js
│   │   └── reviewController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   └── routes/
│       ├── authRoutes.js
│       ├── movieRoutes.js
│       ├── bookingRoutes.js
│       └── reviewRoutes.js
│
├── package.json
├── package-lock.json
└── README.md
```

> The exact structure may change as development continues.

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/savannah-cinemas.git
```

Navigate into the project:

```bash
cd savannah-cinemas
```

---

## 2. Install Dependencies

Install the backend dependencies:

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the backend/server directory or the location expected by the application.

Example:

```env
PORT=5000

DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=1521
DB_NAME=your_database

JWT_SECRET=your_secret_key

EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

**Never commit your `.env` file to GitHub.**

Add it to `.gitignore`:

```gitignore
.env
node_modules/
```

---

# ▶️ Running the Application

Start the backend server:

```bash
node server.js
```

For development, if a development script is configured:

```bash
npm run dev
```

The API will normally be available at:

```text
http://localhost:5000
```

The frontend can then communicate with the backend through the configured API base URL.

---

# 🌐 Accessing the Application on Other Devices

During local development, the application can also be accessed from devices connected to the same network.

For example, if the development computer has the local IP:

```text
192.168.1.100
```

and the API runs on port `5000`:

```text
http://192.168.1.100:5000
```

The frontend API configuration can point to:

```javascript
const API_BASE = "http://192.168.1.100:5000/api";
```

The computer's firewall and network configuration must allow the required connections.

---

# 🔐 Authentication

Authentication is handled by the backend.

The general flow is:

```text
User Login
    ↓
Backend validates credentials
    ↓
JWT generated
    ↓
Frontend stores authentication state
    ↓
Protected requests include token
    ↓
Middleware validates token
    ↓
Request reaches controller
```

Protected endpoints require an authenticated user.

---

# 🔌 API Structure

The backend follows a REST-style API architecture.

Example endpoint groups:

```text
/api/auth
/api/movies
/api/bookings
/api/reviews
/api/showtimes
/api/snacks
```

Example requests:

```http
POST /api/auth/login
POST /api/auth/register

GET /api/movies
GET /api/movies/:id

GET /api/showtimes/:movieId

POST /api/bookings
GET /api/bookings

POST /api/reviews
GET /api/reviews/:movieId
```

The exact endpoints may evolve as the application develops.

---

# 🗄️ Database

The database is responsible for storing the application's core cinema data.

The system is designed around entities such as:

```text
Users
  │
  ├── Bookings
  │      │
  │      ├── Booking Seats
  │      └── Booking Snacks
  │
  ├── Reviews
  │
  └── Watchlist

Movies
  │
  ├── Showtimes
  │      │
  │      └── Screens
  │              │
  │              └── Seats
  │
  └── Reviews
```

Movie status management includes categories such as:

```text
UPCOMING
NOW_SHOWING
ENDED
ARCHIVED
```

---

# 🎫 Booking Architecture

A booking is associated with:

* User
* Movie
* Showtime
* Screen
* Selected seats
* Optional snacks
* Payment information
* Booking confirmation
* QR code

A simplified booking process:

```text
1. User selects movie
2. User selects showtime
3. System loads seat availability
4. User selects seats
5. System calculates ticket cost
6. User optionally selects snacks
7. System calculates final amount
8. Booking is created
9. Confirmation is generated
10. QR code is provided
```

---

# 🎨 Design

Savannah Cinemas uses a premium cinema-inspired visual identity.

### Primary Colors

```text
#14141C
#1D1D28
#F2EFE9
#E8B34C
#B33951
```

The interface aims to combine:

* Dark cinematic backgrounds
* Premium gold accents
* High-contrast typography
* Large movie artwork
* Responsive layouts
* Smooth interactions
* Minimal and modern UI components

---

# 📱 Responsive Design

The frontend is being designed to work across:

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📱 Tablet

The goal is to provide the same core booking experience regardless of screen size.

---

# 🔒 Security Considerations

The project follows several security principles:

* Database credentials are stored outside source code
* `.env` files are excluded from Git
* Database access is performed server-side
* Protected API routes use authentication middleware
* User-specific resources require authentication
* Input validation is applied to API operations
* CORS is configured on the backend

For production deployment, additional security measures should be implemented, including:

* HTTPS
* Secure cookie/token handling
* Production-grade secrets management
* Rate limiting
* Stronger input validation
* Database access restrictions
* Production payment security

---

# 🧪 Development Status

🚧 **Currently in Development**

The project is being developed incrementally, with the following areas being implemented and refined:

* [x] Frontend cinema interface
* [x] Movie browsing
* [x] Movie details
* [x] Authentication foundation
* [x] Backend API
* [x] Database integration
* [x] Reviews
* [x] Watchlist
* [x] Seat selection
* [x] Booking architecture
* [ ] Production payment integration
* [ ] Production deployment
* [ ] Admin dashboard
* [ ] Multi-location cinema management
* [ ] Advanced analytics
* [ ] Customer notifications
* [ ] Mobile optimization
* [ ] Automated testing

---

# 🗺️ Future Roadmap

Future development may include:

### 👨‍💼 Admin Dashboard

Cinema administrators will be able to manage:

* Movies
* Screens
* Seats
* Showtimes
* Bookings
* Customers
* Snacks
* Reviews
* Cinema locations

### 📊 Analytics

Potential analytics include:

* Ticket sales
* Revenue
* Movie performance
* Seat occupancy
* Popular showtimes
* Customer activity
* Snack sales

### 💳 Payments

Integration with a production payment provider for secure online ticket purchases.

### 📧 Notifications

Automated:

* Booking confirmations
* Email receipts
* Showtime reminders
* Booking updates

### 🏢 Multi-Cinema Support

The architecture can eventually support multiple Savannah Cinemas locations.

---

# 🎯 Project Goals

The main goals of the project are to build a cinema platform that is:

* Easy to use
* Visually appealing
* Mobile friendly
* Secure
* Scalable
* Maintainable
* Suitable for real-world cinema operations

The project also serves as a practical full-stack software engineering project covering frontend development, backend APIs, authentication, databases, business logic, and deployment.

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

```bash
git clone https://github.com/YOUR-USERNAME/savannah-cinemas.git
```

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Commit your changes:

```bash
git add .
git commit -m "Add your feature"
```

Push your branch:

```bash
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 📄 License

This project is currently a personal/educational development project.

License information will be added when the project is prepared for public distribution.

---

# 👨‍💻 Author

**Daniel Asamoah**

Software Developer | Full-Stack Development | Oracle | SQL | JavaScript

---

## ⭐ Savannah Cinemas

> **Your movie. Your seat. Your experience.**

Built as a full-stack cinema booking platform with a focus on modern web development and real-world cinema operations.
