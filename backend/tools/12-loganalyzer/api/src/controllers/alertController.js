/**
 * Alert Controller
 * Handle log alert operations
 */

const LogAlert = require("../models/LogAlert");
const alertService = require("../services/alertService");

// Create alert
exports.createAlert = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const alert = new LogAlert({
      userId,
      ...req.body,
    });

    await alert.save();

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get alerts
exports.getAlerts = async (req, res) => {
  try {
    const { enabled, severity, limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id || req.query.userId;

    const filter = { userId };
    if (enabled !== undefined) filter.enabled = enabled === "true";
    if (severity) filter.severity = severity;

    const alerts = await LogAlert.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await LogAlert.countDocuments(filter);

    res.json({
      success: true,
      data: alerts,
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

// Get alert by ID
exports.getAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const alert = await LogAlert.findOne({ _id: id, userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update alert
exports.updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updates = req.body;

    const alert = await LogAlert.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete alert
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const alert = await LogAlert.findOneAndDelete({ _id: id, userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    res.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Test alert
exports.testAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const alert = await LogAlert.findOne({ _id: id, userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }

    const testResult = await alertService.testAlert(alert);

    res.json({
      success: true,
      data: testResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
