import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import postRoutes from "./routes/postRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
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
app.use("/posts", postRoutes);

export default app;
