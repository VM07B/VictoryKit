const CodeIssue = require('../models/Issue');
const CodeScan = require('../models/Scan');
const codeAnalysisService = require('../services/codeAnalysisService');
const { ApiResponse, ApiError, logger } = require('../../../../../shared');

exports.list = async (req, res, next) => {
  try {
    const { scanId, codebaseId, type, severity, status, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user?.id || '000000000000000000000000' };
    
    if (scanId) query.scanId = scanId;
    if (codebaseId) query.codebaseId = codebaseId;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const issues = await CodeIssue.find(query)
      .sort({ severity: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CodeIssue.countDocuments(query);

    res.json(ApiResponse.success({ issues, total, page: parseInt(page) }));
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const issue = await CodeIssue.findById(req.params.id)
      .populate('scanId', 'scanType startedAt')
      .populate('codebaseId', 'name repository');
    
    if (!issue) {
      throw new ApiError(404, 'Issue not found');
    }
    res.json(ApiResponse.success(issue));
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    
    const issue = await CodeIssue.findById(req.params.id);
    if (!issue) {
      throw new ApiError(404, 'Issue not found');
    }

    if (status) {
      issue.status = status;
      if (status === 'fixed') {
        issue.resolvedAt = new Date();
      }
    }

    await issue.save();
    res.json(ApiResponse.success(issue, 'Issue updated'));
  } catch (error) {
    next(error);
  }
};

exports.getFix = async (req, res, next) => {
  try {
    const issue = await CodeIssue.findById(req.params.id);
    if (!issue) {
      throw new ApiError(404, 'Issue not found');
    }

    const fix = codeAnalysisService.generateFix(issue);
    
    res.json(ApiResponse.success({
      issue: {
        id: issue._id,
        type: issue.type,
        category: issue.category
      },
      fix: {
        ...fix,
        autoFixable: issue.fix?.autoFixable || false,
        generatedAt: new Date().toISOString()
      }
    }));
  } catch (error) {
    next(error);
  }
};

exports.report = async (req, res, next) => {
  try {
    const scan = await CodeScan.findById(req.params.scanId)
      .populate('codebaseId', 'name repository languages');
    
    if (!scan) {
      throw new ApiError(404, 'Scan not found');
    }

    const issues = await CodeIssue.find({ scanId: scan._id });
    
    const report = {
      scan: {
        id: scan._id,
        type: scan.scanType,
        status: scan.status,
        startedAt: scan.startedAt,
        completedAt: scan.completedAt
      },
      codebase: scan.codebaseId,
      results: scan.results,
      aiInsights: scan.aiInsights,
      issues: {
        total: issues.length,
        bySeverity: {
          critical: issues.filter(i => i.severity === 'critical'),
          high: issues.filter(i => i.severity === 'high'),
          medium: issues.filter(i => i.severity === 'medium'),
          low: issues.filter(i => i.severity === 'low')
        },
        byType: {
          vulnerability: issues.filter(i => i.type === 'vulnerability').length,
          secret: issues.filter(i => i.type === 'secret').length,
          dependency: issues.filter(i => i.type === 'dependency').length
        }
      },
      generatedAt: new Date().toISOString()
    };

    res.json(ApiResponse.success(report));
  } catch (error) {
    next(error);
  }
};
