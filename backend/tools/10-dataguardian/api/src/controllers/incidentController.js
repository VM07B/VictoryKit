const DataIncident = require('../models/Incident');
const mlService = require('../services/mlService');
const { ApiResponse, ApiError, logger } = require('../../../../../shared');

exports.create = async (req, res, next) => {
  try {
    const { assetId, policyId, type, severity, title, description, details } = req.body;
    
    const incident = new DataIncident({
      userId: req.user?.id || '000000000000000000000000',
      assetId,
      policyId,
      type,
      severity,
      title,
      description,
      details,
      timeline: [{ event: 'Incident created', actor: 'system' }]
    });

    // AI analysis
    const analysis = await mlService.analyzeIncident(incident);
    incident.aiAnalysis = analysis;

    await incident.save();
    logger.info(`Data incident created: ${incident._id}, severity: ${severity}`);
    
    res.status(201).json(ApiResponse.success(incident, 'Incident reported'));
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { type, severity, status, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user?.id || '000000000000000000000000' };
    
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const incidents = await DataIncident.find(query)
      .populate('assetId', 'name type classification')
      .populate('policyId', 'name type')
      .sort({ detectedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await DataIncident.countDocuments(query);

    res.json(ApiResponse.success({ incidents, total, page: parseInt(page) }));
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const incident = await DataIncident.findById(req.params.id)
      .populate('assetId', 'name type classification location')
      .populate('policyId', 'name type rules');
    
    if (!incident) {
      throw new ApiError(404, 'Incident not found');
    }
    res.json(ApiResponse.success(incident));
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { status, response } = req.body;
    
    const incident = await DataIncident.findById(req.params.id);
    if (!incident) {
      throw new ApiError(404, 'Incident not found');
    }

    if (status) {
      incident.status = status;
      incident.timeline.push({
        event: `Status changed to ${status}`,
        actor: req.user?.email || 'system'
      });
      
      if (status === 'resolved') {
        incident.resolvedAt = new Date();
      }
    }

    if (response) {
      incident.response = { ...incident.response, ...response };
    }

    await incident.save();

    res.json(ApiResponse.success(incident, 'Incident updated'));
  } catch (error) {
    next(error);
  }
};

exports.addAction = async (req, res, next) => {
  try {
    const { action, notes } = req.body;
    
    const incident = await DataIncident.findById(req.params.id);
    if (!incident) {
      throw new ApiError(404, 'Incident not found');
    }

    incident.response.actions = incident.response.actions || [];
    incident.response.actions.push({
      action,
      performedBy: req.user?.email || 'system',
      performedAt: new Date(),
      notes
    });

    incident.timeline.push({
      event: `Action taken: ${action}`,
      actor: req.user?.email || 'system'
    });

    await incident.save();

    res.json(ApiResponse.success(incident, 'Action added'));
  } catch (error) {
    next(error);
  }
};

exports.analyze = async (req, res, next) => {
  try {
    const incident = await DataIncident.findById(req.params.id);
    if (!incident) {
      throw new ApiError(404, 'Incident not found');
    }

    const analysis = await mlService.analyzeIncident(incident);
    
    incident.aiAnalysis = analysis;
    incident.timeline.push({
      event: 'AI analysis performed',
      actor: 'ai-system'
    });
    await incident.save();

    res.json(ApiResponse.success({
      incidentId: incident._id,
      analysis
    }));
  } catch (error) {
    next(error);
  }
};

exports.dashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id || '000000000000000000000000';
    
    const [total, bySeverity, byStatus, byType, recent] = await Promise.all([
      DataIncident.countDocuments({ userId }),
      DataIncident.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      DataIncident.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      DataIncident.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      DataIncident.find({ userId })
        .sort({ detectedAt: -1 })
        .limit(5)
        .select('title type severity status detectedAt')
    ]);

    res.json(ApiResponse.success({
      total,
      bySeverity: bySeverity.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      byType: byType.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
      recentIncidents: recent
    }));
  } catch (error) {
    next(error);
  }
};
