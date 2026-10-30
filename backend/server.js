const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CodeNova Event Registration API is running!",
  });
});

// API routes
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);

// Not found route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

// Start server after MongoDB connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();