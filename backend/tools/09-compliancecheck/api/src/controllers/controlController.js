const ComplianceControl = require('../models/Control');
const mlService = require('../services/mlService');
const { ApiResponse, ApiError, logger } = require('../../../../../shared');

exports.list = async (req, res, next) => {
  try {
    const { auditId, framework, status, priority, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (auditId) query.auditId = auditId;
    if (framework) query.framework = framework;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const controls = await ComplianceControl.find(query)
      .sort({ priority: 1, controlId: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ComplianceControl.countDocuments(query);

    res.json(ApiResponse.success({ controls, total, page: parseInt(page) }));
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const control = await ComplianceControl.findById(req.params.id)
      .populate('auditId', 'name frameworks status');
    
    if (!control) {
      throw new ApiError(404, 'Control not found');
    }
    res.json(ApiResponse.success(control));
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { status, findings, remediation, evidence } = req.body;
    
    const control = await ComplianceControl.findById(req.params.id);
    if (!control) {
      throw new ApiError(404, 'Control not found');
    }

    if (status) control.status = status;
    if (findings) control.findings = { ...control.findings, ...findings };
    if (remediation) control.remediation = { ...control.remediation, ...remediation };
    if (evidence) control.evidence.push(...evidence);
    
    control.assessedAt = new Date();
    await control.save();

    res.json(ApiResponse.success(control, 'Control updated'));
  } catch (error) {
    next(error);
  }
};

exports.assess = async (req, res, next) => {
  try {
    const control = await ComplianceControl.findById(req.params.id);
    if (!control) {
      throw new ApiError(404, 'Control not found');
    }

    // Use AI to assess control
    const assessment = await mlService.assessControl(control, control.evidence);
    
    control.aiAssessment = {
      suggestedStatus: assessment.suggestedStatus,
      confidence: assessment.confidence,
      reasoning: assessment.reasoning
    };
    
    await control.save();

    res.json(ApiResponse.success({
      controlId: control._id,
      assessment: control.aiAssessment
    }));
  } catch (error) {
    next(error);
  }
};

exports.addEvidence = async (req, res, next) => {
  try {
    const { type, name, url } = req.body;
    
    const control = await ComplianceControl.findById(req.params.id);
    if (!control) {
      throw new ApiError(404, 'Control not found');
    }

    control.evidence.push({
      type,
      name,
      url,
      uploadedAt: new Date()
    });

    await control.save();

    res.json(ApiResponse.success(control, 'Evidence added'));
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const { controlIds, status, findings } = req.body;
    
    if (!controlIds || controlIds.length === 0) {
      throw new ApiError(400, 'Control IDs required');
    }

    const updateData = { assessedAt: new Date() };
    if (status) updateData.status = status;
    if (findings) updateData.findings = findings;

    const result = await ComplianceControl.updateMany(
      { _id: { $in: controlIds } },
      updateData
    );

    res.json(ApiResponse.success({
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} controls updated`
    }));
  } catch (error) {
    next(error);
  }
};
