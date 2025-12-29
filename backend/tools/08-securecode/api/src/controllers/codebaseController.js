const Codebase = require('../models/Codebase');
const { ApiResponse, ApiError, logger } = require('../../../../../shared');

exports.create = async (req, res, next) => {
  try {
    const { name, repository, languages, frameworks } = req.body;
    
    const codebase = new Codebase({
      userId: req.user?.id || '000000000000000000000000',
      name,
      repository,
      languages,
      frameworks
    });

    await codebase.save();
    logger.info(`Codebase created: ${codebase._id}`);
    
    res.status(201).json(ApiResponse.success(codebase, 'Codebase registered successfully'));
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { status, language, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user?.id || '000000000000000000000000' };
    
    if (status) query.status = status;
    if (language) query.languages = language;

    const codebases = await Codebase.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Codebase.countDocuments(query);

    res.json(ApiResponse.success({ codebases, total, page: parseInt(page), limit: parseInt(limit) }));
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const codebase = await Codebase.findById(req.params.id);
    if (!codebase) {
      throw new ApiError(404, 'Codebase not found');
    }
    res.json(ApiResponse.success(codebase));
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date();

    const codebase = await Codebase.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!codebase) {
      throw new ApiError(404, 'Codebase not found');
    }

    res.json(ApiResponse.success(codebase, 'Codebase updated'));
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const codebase = await Codebase.findByIdAndDelete(req.params.id);
    if (!codebase) {
      throw new ApiError(404, 'Codebase not found');
    }
    res.json(ApiResponse.success(null, 'Codebase deleted'));
  } catch (error) {
    next(error);
  }
};

exports.sync = async (req, res, next) => {
  try {
    const codebase = await Codebase.findById(req.params.id);
    if (!codebase) {
      throw new ApiError(404, 'Codebase not found');
    }

    codebase.status = 'syncing';
    await codebase.save();

    // Simulate sync process
    setTimeout(async () => {
      codebase.status = 'active';
      codebase.stats.lastCommit = new Date().toISOString();
      codebase.updatedAt = new Date();
      await codebase.save();
    }, 3000);

    res.json(ApiResponse.success({ message: 'Sync started', codebaseId: codebase._id }));
  } catch (error) {
    next(error);
  }
};
