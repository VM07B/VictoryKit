/**
 * Analysis Controller
 * Handle log analysis operations
 */

const LogAnalysis = require("../models/LogAnalysis");
const LogEntry = require("../models/LogEntry");
const analysisService = require("../services/analysisService");

// Create analysis
exports.createAnalysis = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { timeRange, filters } = req.body;

    const analysis = new LogAnalysis({
      userId,
      timeRange,
      status: "processing",
    });

    await analysis.save();

    // Start analysis in background
    analysisService.performAnalysis(analysis._id, userId, timeRange, filters);

    res.status(201).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get analyses
exports.getAnalyses = async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    const userId = req.user?.id || req.query.userId;

    const filter = { userId };
    if (status) filter.status = status;

    const analyses = await LogAnalysis.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate("logEntryIds", "message level source timestamp");

    const total = await LogAnalysis.countDocuments(filter);

    res.json({
      success: true,
      data: analyses,
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

// Get analysis by ID
exports.getAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const analysis = await LogAnalysis.findOne({ _id: id, userId }).populate(
      "logEntryIds",
      "message level source timestamp metadata"
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: "Analysis not found",
      });
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get analysis summary
exports.getAnalysisSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    const timeFilter = {};
    if (startDate) timeFilter.$gte = new Date(startDate);
    if (endDate) timeFilter.$lte = new Date(endDate);

    const matchStage = { userId };
    if (Object.keys(timeFilter).length > 0) {
      matchStage.timestamp = timeFilter;
    }

    const summary = await LogEntry.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          errorCount: {
            $sum: { $cond: [{ $eq: ["$level", "error"] }, 1, 0] },
          },
          warningCount: {
            $sum: { $cond: [{ $eq: ["$level", "warn"] }, 1, 0] },
          },
          criticalCount: {
            $sum: { $cond: [{ $in: ["$level", ["error", "critical"]] }, 1, 0] },
          },
          sources: { $addToSet: "$source" },
          levels: { $addToSet: "$level" },
        },
      },
    ]);

    const result = summary[0] || {
      totalEntries: 0,
      errorCount: 0,
      warningCount: 0,
      criticalCount: 0,
      sources: [],
      levels: [],
    };

    res.json({
      success: true,
      data: {
        ...result,
        uniqueSources: result.sources.length,
        uniqueLevels: result.levels.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
