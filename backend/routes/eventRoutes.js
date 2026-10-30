const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const adminAuth = require("../middleware/adminAuth");

// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);

// Admin routes
router.post("/", adminAuth, createEvent);
router.put("/:id", adminAuth, updateEvent);
router.delete("/:id", adminAuth, deleteEvent);

module.exports = router;