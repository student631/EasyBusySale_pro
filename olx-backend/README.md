# OLX Backend API

Backend server for OLX website built with Node.js, Express.js, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (local or cloud)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `config.env` and rename to `.env`
   - Update PostgreSQL connection details if needed

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
olx-backend/
├── server.js          # Main server file
├── config.env         # Environment configuration
├── package.json       # Dependencies and scripts
├── routes/            # API routes
├── models/            # Database models
├── controllers/       # Route controllers
└── middleware/        # Custom middleware
```

## 🔗 API Endpoints

### Health Check
- `GET /` - Welcome message
- `GET /api/health` - Server health status

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client for Node.js
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables

## 📝 Next Steps

1. Set up PostgreSQL connection
2. Create user authentication
3. Add advertisement CRUD operations
4. Implement search functionality
5. Add image upload capability

## 🔧 Development

The server runs on `http://localhost:5000` by default.

Use `npm run dev` for development with auto-restart.
