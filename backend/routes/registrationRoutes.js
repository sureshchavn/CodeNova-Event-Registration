const express = require("express");
const router = express.Router();

const {
  registerForEvent,
  getRegistrations,
  getEventRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
} = require("../controllers/registrationController");

const adminAuth = require("../middleware/adminAuth");

// Public registration
router.post("/", registerForEvent);

// Admin routes
router.get("/", adminAuth, getRegistrations);
router.get("/event/:eventId", adminAuth, getEventRegistrations);
router.put("/:id", adminAuth, updateRegistrationStatus);
router.delete("/:id", adminAuth, deleteRegistration);

module.exports = router;