# RaktSetu Backend API

Backend server for the RaktSetu Blood Bank Management System.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure secret key for JWT signing
- `PORT` - Server port (default: 3000)

### 3. Run the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |

### Blood Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | List blood requests |
| POST | `/api/requests` | Create blood request |
| GET | `/api/requests/:id` | Get single request |
| PUT | `/api/requests/:id` | Update request status |
| DELETE | `/api/requests/:id` | Delete request |

### Admin (Admin role only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/stats` | Dashboard statistics |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   ├── auth.js            # JWT authentication
│   ├── roleCheck.js       # Role-based access control
│   └── validate.js        # Input validation
├── models/
│   ├── User.js            # User schema
│   ├── BloodRequest.js    # Blood request schema
│   └── Donation.js        # Donation tracking
├── routes/
│   ├── auth.js            # Auth endpoints
│   ├── users.js           # User endpoints
│   ├── bloodRequests.js   # Request endpoints
│   └── admin.js           # Admin endpoints
├── .env                   # Environment variables
├── .env.example           # Template
├── index.js               # Main server
└── package.json
```

## Roles

- **admin** - Full system access
- **donor** - Blood donors
- **seeker** - Blood seekers
- **hospital** - Hospital staff
