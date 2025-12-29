const DataAsset = require('../models/Asset');
const dataProtectionService = require('../services/dataProtectionService');
const { ApiResponse, ApiError, logger } = require('../../../../../shared');

exports.create = async (req, res, next) => {
  try {
    const { name, type, classification, dataTypes, location, encryption, accessControl, retention } = req.body;
    
    const asset = new DataAsset({
      userId: req.user?.id || '000000000000000000000000',
      name,
      type,
      classification,
      dataTypes,
      location,
      encryption,
      accessControl,
      retention
    });

    // Auto-assess risk
    const riskAssessment = await dataProtectionService.assessAssetRisk(asset);
    asset.riskScore = riskAssessment.riskScore;

    await asset.save();
    logger.info(`Data asset created: ${asset._id}`);
    
    res.status(201).json(ApiResponse.success({
      asset,
      riskAssessment
    }, 'Asset registered successfully'));
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { type, classification, dataType, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user?.id || '000000000000000000000000' };
    
    if (type) query.type = type;
    if (classification) query.classification = classification;
    if (dataType) query.dataTypes = dataType;

    const assets = await DataAsset.find(query)
      .sort({ riskScore: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await DataAsset.countDocuments(query);

    res.json(ApiResponse.success({ assets, total, page: parseInt(page) }));
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const asset = await DataAsset.findById(req.params.id);
    if (!asset) {
      throw new ApiError(404, 'Asset not found');
    }
    res.json(ApiResponse.success(asset));
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date();

    const asset = await DataAsset.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!asset) {
      throw new ApiError(404, 'Asset not found');
    }

    // Re-assess risk
    const riskAssessment = await dataProtectionService.assessAssetRisk(asset);
    asset.riskScore = riskAssessment.riskScore;
    await asset.save();

    res.json(ApiResponse.success({ asset, riskAssessment }, 'Asset updated'));
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const asset = await DataAsset.findByIdAndDelete(req.params.id);
    if (!asset) {
      throw new ApiError(404, 'Asset not found');
    }
    res.json(ApiResponse.success(null, 'Asset deleted'));
  } catch (error) {
    next(error);
  }
};

exports.classify = async (req, res, next) => {
  try {
    const asset = await DataAsset.findById(req.params.id);
    if (!asset) {
      throw new ApiError(404, 'Asset not found');
    }

    const classification = await dataProtectionService.classifyAsset(asset);
    
    asset.classification = classification.classification;
    asset.dataTypes = classification.dataTypes;
    asset.updatedAt = new Date();
    await asset.save();

    res.json(ApiResponse.success({
      assetId: asset._id,
      ...classification
    }));
  } catch (error) {
    next(error);
  }
};

exports.assessRisk = async (req, res, next) => {
  try {
    const asset = await DataAsset.findById(req.params.id);
    if (!asset) {
      throw new ApiError(404, 'Asset not found');
    }

    const assessment = await dataProtectionService.assessAssetRisk(asset);
    
    asset.riskScore = assessment.riskScore;
    asset.updatedAt = new Date();
    await asset.save();

    res.json(ApiResponse.success({
      assetId: asset._id,
      assetName: asset.name,
      ...assessment
    }));
  } catch (error) {
    next(error);
  }
};

exports.scanPII = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      throw new ApiError(400, 'Content is required for PII scanning');
    }

    const results = await dataProtectionService.scanForPII(content);

    res.json(ApiResponse.success(results));
  } catch (error) {
    next(error);
  }
};
