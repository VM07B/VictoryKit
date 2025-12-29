const ComplianceAudit = require('../models/Audit');
const ComplianceControl = require('../models/Control');
const complianceService = require('../services/complianceService');
const { ApiResponse, ApiError, logger } = require('../../../../../shared');

exports.create = async (req, res, next) => {
  try {
    const { name, frameworks, scope, schedule } = req.body;
    
    const audit = new ComplianceAudit({
      userId: req.user?.id || '000000000000000000000000',
      name,
      frameworks,
      scope,
      schedule
    });

    await audit.save();

    // Generate controls for each framework
    for (const framework of frameworks) {
      const controls = complianceService.generateControlsForFramework(framework);
      
      for (const controlData of controls) {
        const control = new ComplianceControl({
          auditId: audit._id,
          framework,
          ...controlData
        });
        await control.save();
      }
    }

    logger.info(`Audit created: ${audit._id} with ${frameworks.length} frameworks`);
    
    res.status(201).json(ApiResponse.success(audit, 'Audit created with controls'));
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { status, framework, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user?.id || '000000000000000000000000' };
    
    if (status) query.status = status;
    if (framework) query.frameworks = framework;

    const audits = await ComplianceAudit.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ComplianceAudit.countDocuments(query);

    res.json(ApiResponse.success({ audits, total, page: parseInt(page) }));
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const audit = await ComplianceAudit.findById(req.params.id);
    if (!audit) {
      throw new ApiError(404, 'Audit not found');
    }

    const controls = await ComplianceControl.find({ auditId: audit._id });
    
    res.json(ApiResponse.success({ audit, controlCount: controls.length }));
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date();

    const audit = await ComplianceAudit.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!audit) {
      throw new ApiError(404, 'Audit not found');
    }

    res.json(ApiResponse.success(audit, 'Audit updated'));
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const audit = await ComplianceAudit.findByIdAndDelete(req.params.id);
    if (!audit) {
      throw new ApiError(404, 'Audit not found');
    }

    // Delete associated controls
    await ComplianceControl.deleteMany({ auditId: req.params.id });
    
    res.json(ApiResponse.success(null, 'Audit deleted'));
  } catch (error) {
    next(error);
  }
};

exports.assess = async (req, res, next) => {
  try {
    const audit = await ComplianceAudit.findById(req.params.id);
    if (!audit) {
      throw new ApiError(404, 'Audit not found');
    }

    audit.status = 'in-progress';
    await audit.save();

    const controls = await ComplianceControl.find({ auditId: audit._id });
    
    // Run assessment
    const assessment = await complianceService.assessAudit(audit, controls);
    
    // Update audit with results
    audit.status = 'completed';
    audit.progress = 100;
    audit.results = {
      overallScore: assessment.overallScore,
      passedControls: assessment.passedControls,
      failedControls: assessment.failedControls,
      partialControls: assessment.partialControls,
      notApplicable: assessment.notApplicable
    };
    audit.riskLevel = assessment.riskLevel;
    audit.aiSummary = {
      overview: `Compliance audit completed with ${assessment.overallScore}% score`,
      keyFindings: [`${assessment.passedControls} controls passed`, `${assessment.failedControls} controls failed`],
      criticalGaps: assessment.gaps.filter(g => g.severity === 'critical').map(g => g.controlId),
      recommendations: assessment.recommendations,
      estimatedRemediationTime: complianceService.calculateRemediationTime(
        controls.filter(c => c.status === 'failed'),
        audit.riskLevel
      )
    };
    audit.updatedAt = new Date();
    await audit.save();

    logger.info(`Audit assessed: ${audit._id}, score: ${assessment.overallScore}%`);

    res.json(ApiResponse.success({
      auditId: audit._id,
      ...assessment
    }));
  } catch (error) {
    next(error);
  }
};

exports.report = async (req, res, next) => {
  try {
    const audit = await ComplianceAudit.findById(req.params.id);
    if (!audit) {
      throw new ApiError(404, 'Audit not found');
    }

    const controls = await ComplianceControl.find({ auditId: audit._id });

    const report = {
      audit: {
        id: audit._id,
        name: audit.name,
        frameworks: audit.frameworks,
        status: audit.status,
        createdAt: audit.createdAt
      },
      results: audit.results,
      riskLevel: audit.riskLevel,
      aiSummary: audit.aiSummary,
      controls: {
        total: controls.length,
        byStatus: {
          passed: controls.filter(c => c.status === 'passed').length,
          failed: controls.filter(c => c.status === 'failed').length,
          partial: controls.filter(c => c.status === 'partial').length,
          notAssessed: controls.filter(c => c.status === 'not-assessed').length
        },
        byFramework: audit.frameworks.reduce((acc, fw) => {
          acc[fw] = controls.filter(c => c.framework === fw).length;
          return acc;
        }, {})
      },
      generatedAt: new Date().toISOString()
    };

    res.json(ApiResponse.success(report));
  } catch (error) {
    next(error);
  }
};
