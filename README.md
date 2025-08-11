# MSGC Transport Management Application

A full-stack transport management application built with modern web technologies.

## 🚀 Tech Stack

- **Frontend**: Vite + React
- **Backend**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL

## 📁 Project Structure

```
MSGC-Transport-Management-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── server/                 # Express backend
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── index.js           # Express server
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
└── package.json           # Root package.json with scripts
```

## 🗄️ Database Models

### Transport
- `id` (String, Primary Key)
- `name` (String)
- `commissionRate` (Float)
- `createdAt` (DateTime)

### Booking
- `id` (String, Primary Key)
- `grNumber` (String, Unique)
- `bookingDate` (DateTime)
- `quantity` (Int)
- `weightKg` (Float)
- `toPayAmount` (Float)
- `paidAmount` (Float)
- `deliveryStation` (String)
- `localCartage` (Float)
- `transportId` (String, Foreign Key)
- `createdAt` (DateTime)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Database Setup

1. Create a PostgreSQL database named `transport_management`
2. Copy `server/env.example` to `server/.env`
3. Update the `DATABASE_URL` in `server/.env` with your database credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/transport_management?schema=public"
   ```

### 3. Initialize Database
```bash
cd server
npm run db:generate
npm run db:push
```

### 4. Start Development Servers
```bash
npm run dev
```

This will start both servers concurrently:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📡 API Endpoints

### Test Endpoints
- `GET /api/test` - Test API connection
- `GET /api/health` - Health check with database connection

## 🎯 Features

- ✅ Full-stack React + Express setup
- ✅ Prisma ORM with PostgreSQL
- ✅ CORS and JSON middleware
- ✅ API proxy configuration
- ✅ Modern UI with responsive design
- ✅ Real-time API testing
- ✅ Concurrent development servers

## 🚀 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production
- `npm run start` - Start production server

### Server Only
- `npm run server:dev` - Start backend in development
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Client Only
- `npm run client:dev` - Start frontend in development
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔧 Development

The application uses a proxy configuration in Vite, so API calls from the frontend will automatically be forwarded to the backend server running on port 5000.

## 📝 Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/transport_management?schema=public"
PORT=5000
NODE_ENV=development
```

## 🎨 UI Features

- Modern gradient design
- Glassmorphism effects
- Responsive layout
- Interactive API testing
- Real-time status updates
- Hover animations

## 🔄 Next Steps

1. Add authentication system
2. Implement CRUD operations for Transport and Booking
3. Add form validation
4. Implement search and filtering
5. Add data visualization charts
6. Set up production deployment

## 📄 License

MIT License 