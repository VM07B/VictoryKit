/**
 * Log Controller
 * Handle log entry operations
 */

const LogEntry = require("../models/LogEntry");
const logService = require("../services/logService");

// Create log entry
exports.createLogEntry = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const logEntry = new LogEntry({
      userId,
      ...req.body,
    });

    await logEntry.save();

    res.status(201).json({
      success: true,
      data: logEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get log entries
exports.getLogEntries = async (req, res) => {
  try {
    const {
      source,
      level,
      severity,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
      search,
    } = req.query;
    const userId = req.user?.id || req.query.userId;

    const filter = { userId };
    if (source) filter.source = source;
    if (level) filter.level = level;
    if (severity) filter.severity = severity;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { message: new RegExp(search, "i") },
        { "metadata.hostname": new RegExp(search, "i") },
        { tags: new RegExp(search, "i") },
      ];
    }

    const logEntries = await LogEntry.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate("userId", "username email");

    const total = await LogEntry.countDocuments(filter);

    res.json({
      success: true,
      data: logEntries,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get log entry by ID
exports.getLogEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const logEntry = await LogEntry.findOne({ _id: id, userId }).populate(
      "userId",
      "username email"
    );

    if (!logEntry) {
      return res.status(404).json({
        success: false,
        error: "Log entry not found",
      });
    }

    res.json({
      success: true,
      data: logEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update log entry
exports.updateLogEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const logEntry = await LogEntry.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!logEntry) {
      return res.status(404).json({
        success: false,
        error: "Log entry not found",
      });
    }

    res.json({
      success: true,
      data: logEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete log entry
exports.deleteLogEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const logEntry = await LogEntry.findOneAndDelete({ _id: id, userId });

    if (!logEntry) {
      return res.status(404).json({
        success: false,
        error: "Log entry not found",
      });
    }

    res.json({
      success: true,
      message: "Log entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Analyze log entry
exports.analyzeLogEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const logEntry = await LogEntry.findOne({ _id: id, userId });

    if (!logEntry) {
      return res.status(404).json({
        success: false,
        error: "Log entry not found",
      });
    }

    const analysis = await logService.analyzeLogEntry(logEntry);

    // Update log entry with analysis
    logEntry.analyzed = true;
    logEntry.analysis = analysis;
    await logEntry.save();

    res.json({
      success: true,
      data: {
        logEntry,
        analysis,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
