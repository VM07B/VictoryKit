const DataPolicy = require('../models/Policy');
const DataAsset = require('../models/Asset');
const dataProtectionService = require('../services/dataProtectionService');
const { ApiResponse, ApiError, logger } = require('../../../../../shared');

exports.create = async (req, res, next) => {
  try {
    const { name, type, scope, rules, enforcement, notifications } = req.body;
    
    const policy = new DataPolicy({
      userId: req.user?.id || '000000000000000000000000',
      name,
      type,
      scope,
      rules,
      enforcement,
      notifications
    });

    await policy.save();
    logger.info(`Data policy created: ${policy._id}`);
    
    res.status(201).json(ApiResponse.success(policy, 'Policy created successfully'));
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user?.id || '000000000000000000000000' };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const policies = await DataPolicy.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await DataPolicy.countDocuments(query);

    res.json(ApiResponse.success({ policies, total, page: parseInt(page) }));
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const policy = await DataPolicy.findById(req.params.id);
    if (!policy) {
      throw new ApiError(404, 'Policy not found');
    }
    res.json(ApiResponse.success(policy));
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date();

    const policy = await DataPolicy.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!policy) {
      throw new ApiError(404, 'Policy not found');
    }

    res.json(ApiResponse.success(policy, 'Policy updated'));
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const policy = await DataPolicy.findByIdAndDelete(req.params.id);
    if (!policy) {
      throw new ApiError(404, 'Policy not found');
    }
    res.json(ApiResponse.success(null, 'Policy deleted'));
  } catch (error) {
    next(error);
  }
};

exports.activate = async (req, res, next) => {
  try {
    const policy = await DataPolicy.findById(req.params.id);
    if (!policy) {
      throw new ApiError(404, 'Policy not found');
    }

    policy.status = 'active';
    policy.enforcement.mode = 'enforce';
    policy.enforcement.startDate = new Date();
    policy.updatedAt = new Date();
    await policy.save();

    res.json(ApiResponse.success(policy, 'Policy activated'));
  } catch (error) {
    next(error);
  }
};

exports.evaluate = async (req, res, next) => {
  try {
    const policy = await DataPolicy.findById(req.params.id);
    if (!policy) {
      throw new ApiError(404, 'Policy not found');
    }

    // Get applicable assets
    const assetQuery = { userId: policy.userId };
    if (policy.scope.classifications?.length > 0) {
      assetQuery.classification = { $in: policy.scope.classifications };
    }
    if (policy.scope.dataTypes?.length > 0) {
      assetQuery.dataTypes = { $in: policy.scope.dataTypes };
    }

    const assets = await DataAsset.find(assetQuery);
    const evaluation = await dataProtectionService.evaluatePolicy(policy, assets);

    // Update violation count
    policy.violations = evaluation.violations.length;
    policy.lastTriggered = evaluation.violations.length > 0 ? new Date() : policy.lastTriggered;
    await policy.save();

    res.json(ApiResponse.success(evaluation));
  } catch (error) {
    next(error);
  }
};

exports.getViolations = async (req, res, next) => {
  try {
    const policy = await DataPolicy.findById(req.params.id);
    if (!policy) {
      throw new ApiError(404, 'Policy not found');
    }

    const assetQuery = { userId: policy.userId };
    if (policy.scope.classifications?.length > 0) {
      assetQuery.classification = { $in: policy.scope.classifications };
    }

    const assets = await DataAsset.find(assetQuery);
    const evaluation = await dataProtectionService.evaluatePolicy(policy, assets);

    res.json(ApiResponse.success({
      policyId: policy._id,
      policyName: policy.name,
      violations: evaluation.violations,
      totalViolations: evaluation.violations.length
    }));
  } catch (error) {
    next(error);
  }
};
