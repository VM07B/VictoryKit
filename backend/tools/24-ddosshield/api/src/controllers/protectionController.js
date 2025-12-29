/**
 * Protection Controller - DDoS protection rules
 */

const Protection = require("../models/Protection");

const protectionController = {
  // Get all protections
  async getAll(req, res) {
    try {
      const { type, status } = req.query;
      const query = {};

      if (type) query.type = type;
      if (status) query.status = status;

      const protections = await Protection.find(query).sort({ updatedAt: -1 });

      res.json({ success: true, data: protections });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get protection by ID
  async getById(req, res) {
    try {
      const protection = await Protection.findOne({
        $or: [{ _id: req.params.id }, { protectionId: req.params.id }],
      });

      if (!protection) {
        return res
          .status(404)
          .json({ success: false, error: "Protection not found" });
      }

      res.json({ success: true, data: protection });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Create protection
  async create(req, res) {
    try {
      const protection = new Protection(req.body);
      await protection.save();

      res.status(201).json({ success: true, data: protection });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update protection
  async update(req, res) {
    try {
      const protection = await Protection.findOneAndUpdate(
        { $or: [{ _id: req.params.id }, { protectionId: req.params.id }] },
        { $set: req.body },
        { new: true }
      );

      if (!protection) {
        return res
          .status(404)
          .json({ success: false, error: "Protection not found" });
      }

      res.json({ success: true, data: protection });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Delete protection
  async delete(req, res) {
    try {
      const protection = await Protection.findOneAndDelete({
        $or: [{ _id: req.params.id }, { protectionId: req.params.id }],
      });

      if (!protection) {
        return res
          .status(404)
          .json({ success: false, error: "Protection not found" });
      }

      res.json({ success: true, message: "Protection deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Activate protection
  async activate(req, res) {
    try {
      const protection = await Protection.findOneAndUpdate(
        { $or: [{ _id: req.params.id }, { protectionId: req.params.id }] },
        {
          $set: { status: "active" },
          $inc: { "statistics.activations": 1 },
          $currentDate: { "statistics.lastActivated": true },
        },
        { new: true }
      );

      if (!protection) {
        return res
          .status(404)
          .json({ success: false, error: "Protection not found" });
      }

      res.json({
        success: true,
        data: protection,
        message: "Protection activated",
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = protectionController;
