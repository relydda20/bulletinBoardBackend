import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import postRoutes from "./routes/postRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./db.js";
import passport from "./config/passport.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

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

// Connect to MongoDB, then start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "Failed to start server due to DB connection error:",
      err.message
    );
    process.exit(1);
  });
