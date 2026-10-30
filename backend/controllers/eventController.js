const Event = require("../models/Event");
const Registration = require("../models/Registration");

// GET all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registeredCount = await Registration.countDocuments({
          event: event._id,
          status: "Registered",
        });

        return {
          ...event.toObject(),
          registeredCount,
          availableSeats: Math.max(
            0,
            event.capacity - registeredCount
          ),
        };
      })
    );

    res.status(200).json({
      success: true,
      count: events.length,
      data: eventsWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET single event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const registeredCount = await Registration.countDocuments({
      event: event._id,
      status: "Registered",
    });

    res.status(200).json({
      success: true,
      data: {
        ...event.toObject(),
        registeredCount,
        availableSeats: Math.max(
          0,
          event.capacity - registeredCount
        ),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid event ID.",
    });
  }
};

// CREATE event
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: event,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      data: event,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event and its registrations deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};