const ComplianceFramework = require('../models/Framework');
const complianceService = require('../services/complianceService');
const { ApiResponse, ApiError, logger } = require('../../../../../shared');

exports.list = async (req, res, next) => {
  try {
    const { category, active } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (active !== undefined) query.isActive = active === 'true';

    const frameworks = await ComplianceFramework.find(query)
      .select('name version description category totalControls isActive')
      .sort({ name: 1 });

    res.json(ApiResponse.success(frameworks));
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const framework = await ComplianceFramework.findOne({ name: req.params.name.toUpperCase() });
    
    if (!framework) {
      // Return generated framework details
      const details = complianceService.getFrameworkDetails(req.params.name.toUpperCase());
      if (!details) {
        throw new ApiError(404, 'Framework not found');
      }

      return res.json(ApiResponse.success({
        name: req.params.name.toUpperCase(),
        ...details,
        source: 'generated'
      }));
    }

    res.json(ApiResponse.success(framework));
  } catch (error) {
    next(error);
  }
};

exports.getControls = async (req, res, next) => {
  try {
    const frameworkName = req.params.name.toUpperCase();
    const controls = complianceService.generateControlsForFramework(frameworkName);
    
    if (controls.length === 0) {
      throw new ApiError(404, 'Framework not found');
    }

    res.json(ApiResponse.success({
      framework: frameworkName,
      totalControls: controls.length,
      controls
    }));
  } catch (error) {
    next(error);
  }
};

exports.compare = async (req, res, next) => {
  try {
    const { frameworks } = req.body;
    
    if (!frameworks || frameworks.length < 2) {
      throw new ApiError(400, 'At least 2 frameworks required for comparison');
    }

    const comparison = frameworks.map(name => {
      const details = complianceService.getFrameworkDetails(name.toUpperCase());
      return {
        name: name.toUpperCase(),
        controls: details?.controls || 0,
        categories: details?.categories || []
      };
    });

    res.json(ApiResponse.success({
      frameworks: comparison,
      overlap: calculateOverlap(comparison)
    }));
  } catch (error) {
    next(error);
  }
};

function calculateOverlap(frameworks) {
  // Simplified overlap calculation
  const allCategories = new Set();
  frameworks.forEach(f => f.categories.forEach(c => allCategories.add(c.toLowerCase())));
  
  const commonCategories = [...allCategories].filter(cat => 
    frameworks.every(f => f.categories.some(c => c.toLowerCase().includes(cat.split(' ')[0])))
  );

  return {
    commonCategories,
    overlapPercentage: Math.round((commonCategories.length / allCategories.size) * 100)
  };
}
