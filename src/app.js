import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import postRoutes from "./routes/postRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";

const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

// Middleware
// app.use(cors()); // Enable CORS for all origins - not recommended for production

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        // allow requests with no origin (like mobile apps, curl, Postman)
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser()); // for parsing cookies
app.use(express.json());
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(passport.initialize());

// Health check / root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Bulletin Board API",
    endpoints: {
      auth: "/auth",
      users: "/users",
      posts: "/posts",
    },
  });
});

// API Routes
app.use("/auth", authRoutes);
app.use("/auth", passwordResetRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

export default app;
