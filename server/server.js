// server.js
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { DbConnect } from "./utils/DBConnection.js";
import reportRoute from "./routes/report.route.js";
import adminRoutes from "./routes/admin.route.js";
import sosRoutes from './routes/sos.route.js';
import problemRoute from './routes/problem.route.js'
import volunteerAuthRoutes from './routes/volunteers.route.js';
import crimePinRoutes from './routes/crimePin.routes.js';
import { initialize as initializeSocket } from './services/SocketService.js';
import helmet from 'helmet';
import morgan from 'morgan';
const app = express();
const server = http.createServer(app);

const mode = process.env.MODE;

// CORS configuration
if (mode === "dev") {
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:3000", // Added fallback
      credentials: true,
    })
  );
} else if (mode === "prod") {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  );
} else {
  // Default CORS for development
  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  }));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));
// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_String,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Health check - PUT THIS BEFORE OTHER ROUTES
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// APIs
app.get("/test", (req, res) => {
  res.send("Welcome to the Disaster Management Backend Server");
})

app.use("/api", reportRoute);
app.use("/api", adminRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/volunteer', volunteerAuthRoutes);
app.use('/api/problem', problemRoute)
app.use('/api/crime-pins', crimePinRoutes);
// 404 handler for undefined routes
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });


// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Added fallback
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Socket Service
initializeSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("🚀 Server listening at PORT:", PORT);
  console.log("📡 Socket.io server initialized");
  console.log("🌐 Environment:", process.env.NODE_ENV || 'development');
  DbConnect();
});