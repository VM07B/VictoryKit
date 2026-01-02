const FuzzingEngine = require('../services/fuzzing.engine');
const { APIEndpoint, APIScan } = require('../models');

// Run fuzzing on endpoint
exports.fuzzEndpoint = async (req, res) => {
  try {
    const {
      targetUrl,
      method,
      path,
      parameters,
      fuzzCategories = ['injection', 'xss', 'traversal'],
      authentication,
      options = {}
    } = req.body;

    if (!targetUrl || !method || !path) {
      return res.status(400).json({
        success: false,
        error: 'targetUrl, method, and path are required'
      });
    }

    const endpoint = {
      method,
      path,
      parameters,
      fullUrl: `${targetUrl}${path}`
    };

    const fuzzingResults = await FuzzingEngine.fuzzEndpoint(
      targetUrl,
      endpoint,
      authentication,
      {
        categories: fuzzCategories,
        maxPayloads: options.maxPayloads || 50,
        timeout: options.timeout || 10000
      }
    );

    res.json({
      success: true,
      data: {
        endpoint: `${method} ${path}`,
        findings: fuzzingResults,
        payloadsTested: fuzzingResults.length * 10, // Approximate
        categoriesTested: fuzzCategories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get fuzzing payloads
exports.getPayloads = async (req, res) => {
  try {
    const { category } = req.query;
    
    const payloads = FuzzingEngine.getPayloads(category);

    res.json({
      success: true,
      data: {
        payloads,
        categories: ['injection', 'xss', 'traversal', 'command', 'xxe', 'format-string']
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add custom payload
exports.addPayload = async (req, res) => {
  try {
    const { category, name, value, description, expectedBehavior } = req.body;

    if (!category || !value) {
      return res.status(400).json({
        success: false,
        error: 'Category and value are required'
      });
    }

    const payload = {
      name: name || `custom-${Date.now()}`,
      value,
      description,
      expectedBehavior,
      custom: true
    };

    // In a real implementation, this would be stored in database
    res.status(201).json({
      success: true,
      data: { payload },
      message: 'Payload added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Run batch fuzzing on multiple endpoints
exports.batchFuzz = async (req, res) => {
  try {
    const {
      specId,
      targetUrl,
      endpointIds,
      fuzzCategories = ['injection', 'xss'],
      authentication
    } = req.body;

    let endpoints = [];

    if (endpointIds && endpointIds.length > 0) {
      endpoints = await APIEndpoint.find({ _id: { $in: endpointIds } });
    } else if (specId) {
      endpoints = await APIEndpoint.find({ specId }).limit(20);
    }

    if (endpoints.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No endpoints specified or found'
      });
    }

    const allResults = [];

    for (const endpoint of endpoints) {
      const results = await FuzzingEngine.fuzzEndpoint(
        targetUrl || endpoint.fullUrl?.split(endpoint.path)[0],
        endpoint,
        authentication,
        { categories: fuzzCategories, maxPayloads: 20 }
      );
      
      allResults.push({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        findings: results
      });
    }

    res.json({
      success: true,
      data: {
        endpointsTested: endpoints.length,
        totalFindings: allResults.reduce((sum, r) => sum + r.findings.length, 0),
        results: allResults
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Parameter tampering test
exports.testParameterTampering = async (req, res) => {
  try {
    const {
      targetUrl,
      method,
      path,
      originalParams,
      authentication
    } = req.body;

    const tamperResults = await FuzzingEngine.testParameterTampering(
      targetUrl,
      { method, path, parameters: originalParams },
      authentication
    );

    res.json({
      success: true,
      data: {
        endpoint: `${method} ${path}`,
        findings: tamperResults,
        tampersTested: tamperResults.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Start fuzzing session
exports.startFuzzing = async (req, res) => {
  try {
    const { endpointId, payloadCategories, customPayloads, settings } = req.body;

    const endpoint = await APIEndpoint.findById(endpointId);
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    const fuzzingEngine = new FuzzingEngine();
    const sessionId = await fuzzingEngine.startSession(endpoint, {
      payloadCategories: payloadCategories || ['sql-injection', 'xss', 'command-injection'],
      customPayloads,
      settings: {
        maxRequests: settings?.maxRequests || 1000,
        delay: settings?.delay || 100,
        timeout: settings?.timeout || 30000,
        ...settings
      }
    });

    res.json({
      success: true,
      data: { sessionId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Stop fuzzing session
exports.stopFuzzing = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const fuzzingEngine = new FuzzingEngine();
    await fuzzingEngine.stopSession(sessionId);

    res.json({
      success: true,
      message: 'Fuzzing session stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get fuzzing status
exports.getFuzzingStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const fuzzingEngine = new FuzzingEngine();
    const status = await fuzzingEngine.getSessionStatus(sessionId);

    res.json({
      success: true,
      data: { status }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get fuzzing results
exports.getFuzzingResults = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const fuzzingEngine = new FuzzingEngine();
    const results = await fuzzingEngine.getSessionResults(sessionId);

    res.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Generate custom payloads
exports.generatePayloads = async (req, res) => {
  try {
    const { category, count = 10 } = req.body;

    const fuzzingEngine = new FuzzingEngine();
    const payloads = await fuzzingEngine.generatePayloads(category, count);

    res.json({
      success: true,
      data: { payloads }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get payload categories
exports.getPayloadCategories = async (req, res) => {
  try {
    const fuzzingEngine = new FuzzingEngine();
    const categories = fuzzingEngine.getPayloadCategories();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Test single payload
exports.testPayload = async (req, res) => {
  try {
    const { endpointId, payload, parameter } = req.body;

    const endpoint = await APIEndpoint.findById(endpointId);
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    const fuzzingEngine = new FuzzingEngine();
    const result = await fuzzingEngine.testPayload(endpoint, payload, parameter);

    res.json({
      success: true,
      data: { result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
