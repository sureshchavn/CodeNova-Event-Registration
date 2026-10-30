const Event = require("../models/Event");
const Registration = require("../models/Registration");

// REGISTER for an event
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId, name, email, phone, college } = req.body;

    if (!eventId || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Event, name, email, and phone are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    if (event.status !== "Upcoming" || event.date < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Registration is not available for this event.",
      });
    }

    const existingRegistration = await Registration.findOne({
      event: eventId,
      email: normalizedEmail,
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered for this event.",
      });
    }

    const registeredCount = await Registration.countDocuments({
      event: eventId,
      status: "Registered",
    });

    if (registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Sorry, this event is fully booked.",
      });
    }

    const registration = await Registration.create({
      event: eventId,
      name,
      email: normalizedEmail,
      phone,
      college,
    });

    res.status(201).json({
      success: true,
      message: "Registration completed successfully!",
      data: registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered for this event.",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET all registrations (Admin)
exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("event", "title date venue")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET registrations for one event (Admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      event: req.params.eventId,
    })
      .populate("event", "title date venue")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE registration status (Admin)
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Registered", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Registered or Cancelled.",
      });
    }

    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration status updated.",
      data: registration,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE registration (Admin)
exports.deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(
      req.params.id
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};