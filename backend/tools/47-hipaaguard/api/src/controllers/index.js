const axios = require('axios');
const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8047';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'HIPAAGuard', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const mlResponse = await axios.post(`${ML_ENGINE_URL}/analyze`, { data });
    res.json({ success: true, result: mlResponse.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.scan = async (req, res) => {
  try {
    const { target } = req.body;
    const mlResponse = await axios.post(`${ML_ENGINE_URL}/scan`, { target });
    res.json({ success: true, scanId: Date.now(), result: mlResponse.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  res.json({ reports: [], total: 0 });
};

exports.getReportById = async (req, res) => {
  res.json({ id: req.params.id, status: 'pending' });
};

exports.getConfig = async (req, res) => {
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'HIPAA' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};
