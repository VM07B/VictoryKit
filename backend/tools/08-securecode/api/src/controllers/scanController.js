const CodeScan = require('../models/Scan');
const Codebase = require('../models/Codebase');
const CodeIssue = require('../models/Issue');
const codeAnalysisService = require('../services/codeAnalysisService');
const { ApiResponse, ApiError, logger } = require('../../../../../shared');

exports.create = async (req, res, next) => {
  try {
    const { codebaseId, scanType, options } = req.body;
    
    const codebase = await Codebase.findById(codebaseId);
    if (!codebase) {
      throw new ApiError(404, 'Codebase not found');
    }

    const scan = new CodeScan({
      codebaseId,
      userId: req.user?.id || '000000000000000000000000',
      scanType: scanType || 'full',
      options: options || {}
    });

    await scan.save();
    logger.info(`Code scan created: ${scan._id}`);
    
    res.status(201).json(ApiResponse.success(scan, 'Scan created'));
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { codebaseId, status, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user?.id || '000000000000000000000000' };
    
    if (codebaseId) query.codebaseId = codebaseId;
    if (status) query.status = status;

    const scans = await CodeScan.find(query)
      .populate('codebaseId', 'name repository')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CodeScan.countDocuments(query);

    res.json(ApiResponse.success({ scans, total, page: parseInt(page) }));
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const scan = await CodeScan.findById(req.params.id)
      .populate('codebaseId', 'name repository languages');
    
    if (!scan) {
      throw new ApiError(404, 'Scan not found');
    }
    res.json(ApiResponse.success(scan));
  } catch (error) {
    next(error);
  }
};

exports.execute = async (req, res, next) => {
  try {
    const scan = await CodeScan.findById(req.params.id);
    if (!scan) {
      throw new ApiError(404, 'Scan not found');
    }

    if (scan.status !== 'pending') {
      throw new ApiError(400, 'Scan already started or completed');
    }

    scan.status = 'scanning';
    scan.startedAt = new Date();
    await scan.save();

    // Simulate scanning process
    setTimeout(async () => {
      try {
        // Simulate code analysis
        const mockFiles = [
          { path: 'src/index.js', content: 'const password = "secret123";\neval(userInput);' },
          { path: 'src/api.js', content: 'db.query("SELECT * FROM users WHERE id=" + userId);' }
        ];

        const analysis = await codeAnalysisService.analyzeCodebase(mockFiles, scan.options);

        // Save issues
        for (const issue of analysis.issues) {
          const codeIssue = new CodeIssue({
            scanId: scan._id,
            codebaseId: scan.codebaseId,
            userId: scan.userId,
            type: issue.type || 'vulnerability',
            category: issue.category || 'other',
            severity: codeAnalysisService.getSeverity(issue.category),
            title: `${issue.category} detected`,
            description: `Potential ${issue.category} vulnerability found`,
            location: issue.location || { file: issue.snippet || 'unknown' },
            aiConfidence: issue.confidence || 80
          });
          await codeIssue.save();
        }

        scan.status = 'completed';
        scan.completedAt = new Date();
        scan.progress = 100;
        scan.results = {
          filesScanned: analysis.filesScanned,
          issuesFound: analysis.issues.length,
          criticalCount: analysis.summary.critical,
          highCount: analysis.summary.high,
          mediumCount: analysis.summary.medium,
          lowCount: analysis.summary.low,
          securityScore: analysis.securityScore
        };
        scan.aiInsights = {
          summary: `Found ${analysis.issues.length} security issues across ${analysis.filesScanned} files`,
          topRisks: analysis.issues.slice(0, 3).map(i => i.category),
          recommendations: ['Review critical issues immediately', 'Enable secret scanning in CI/CD'],
          estimatedFixTime: `${Math.ceil(analysis.issues.length * 0.5)} hours`
        };
        await scan.save();
        
        logger.info(`Scan completed: ${scan._id}`);
      } catch (error) {
        scan.status = 'failed';
        await scan.save();
        logger.error(`Scan failed: ${error.message}`);
      }
    }, 5000);

    res.json(ApiResponse.success({ 
      message: 'Scan execution started', 
      scanId: scan._id,
      status: scan.status 
    }));
  } catch (error) {
    next(error);
  }
};

exports.status = async (req, res, next) => {
  try {
    const scan = await CodeScan.findById(req.params.id)
      .select('status progress results startedAt completedAt');
    
    if (!scan) {
      throw new ApiError(404, 'Scan not found');
    }
    res.json(ApiResponse.success(scan));
  } catch (error) {
    next(error);
  }
};
