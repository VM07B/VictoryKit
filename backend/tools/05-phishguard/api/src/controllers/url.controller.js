const PhishingUrl = require('../models/URL.model');
const { ApiResponse, ApiError } = require('../../../../shared');
const phishingService = require('../services/phishing.service');
const mlService = require('../services/ml.service');

class UrlController {
  async checkUrl(req, res, next) {
    try {
      const { url } = req.body;
      
      const domain = phishingService.extractDomain(url);
      const protocol = phishingService.extractProtocol(url);
      const urlHash = phishingService.calculateUrlHash(url);
      const urlFeatures = phishingService.extractUrlFeatures(url);

      const urlRecord = new PhishingUrl({
        userId: req.user.id,
        urlId: `URL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalUrl: url,
        domain,
        protocol,
        urlHash,
        urlFeatures,
        status: 'analyzing'
      });

      await urlRecord.save();

      setImmediate(async () => {
        try {
          const mlResult = await mlService.analyzeUrl({ url, domain, urlFeatures });
          const reputation = await mlService.checkReputation(url);

          urlRecord.isPhishing = mlResult.isPhishing;
          urlRecord.riskScore = mlResult.riskScore;
          urlRecord.phishingType = mlResult.phishingType;
          urlRecord.confidence = mlResult.confidence;
          urlRecord.severity = phishingService.determineSeverity(urlRecord);
          urlRecord.mlPrediction = mlResult;
          urlRecord.reputation = reputation;
          urlRecord.status = 'completed';
          urlRecord.lastCheckedAt = new Date();

          await urlRecord.save();
        } catch (error) {
          urlRecord.status = 'failed';
          await urlRecord.save();
        }
      });

      res.status(201).json(ApiResponse.created(urlRecord, 'URL analysis started'));
    } catch (error) {
      next(error);
    }
  }

  async getAllUrls(req, res, next) {
    try {
      const { page = 1, limit = 20, isPhishing, severity } = req.query;
      const query = { userId: req.user.id };
      if (isPhishing !== undefined) query.isPhishing = isPhishing === 'true';
      if (severity) query.severity = severity;

      const urls = await PhishingUrl.find(query)
        .sort({ checkedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-contentAnalysis -domainInfo');

      const total = await PhishingUrl.countDocuments(query);

      res.json(ApiResponse.success({ 
        urls, 
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } 
      }));
    } catch (error) {
      next(error);
    }
  }

  async getUrlById(req, res, next) {
    try {
      const url = await PhishingUrl.findById(req.params.id);
      if (!url) throw ApiError.notFound('URL not found');
      if (url.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      res.json(ApiResponse.success(url));
    } catch (error) {
      next(error);
    }
  }

  async deleteUrl(req, res, next) {
    try {
      const url = await PhishingUrl.findById(req.params.id);
      if (!url) throw ApiError.notFound('URL not found');
      if (url.userId.toString() !== req.user.id && req.user.role !== 'admin') throw ApiError.forbidden('Access denied');
      await url.deleteOne();
      res.json(ApiResponse.success(null, 'URL deleted'));
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const timeRange = startDate && endDate ? { start: new Date(startDate), end: new Date(endDate) } : null;
      const stats = await phishingService.calculateStatistics(req.user.id, timeRange);
      res.json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  }

  async checkBatch(req, res, next) {
    try {
      const { urls } = req.body;
      const results = await Promise.all(
        urls.map(async url => {
          const features = phishingService.extractUrlFeatures(url);
          const analysis = await mlService.analyzeUrl({ url, urlFeatures: features });
          return { url, ...analysis };
        })
      );
      res.json(ApiResponse.success({ results }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UrlController();
