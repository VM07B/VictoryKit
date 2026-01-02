const { APISpec, APIEndpoint } = require('../models');
const OpenAPIParser = require('../services/openapi.parser');

// Upload/Create API spec
exports.createSpec = async (req, res) => {
  try {
    const { name, specType, rawSpec, sourceUrl, servers } = req.body;

    if (!name || !specType) {
      return res.status(400).json({
        success: false,
        error: 'Name and specType are required'
      });
    }

    // Parse spec if provided
    let parsedData = {};
    if (rawSpec) {
      try {
        parsedData = await OpenAPIParser.parse(rawSpec, specType);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          error: `Failed to parse spec: ${parseError.message}`
        });
      }
    }

    const spec = new APISpec({
      name,
      specType,
      specFormat: typeof rawSpec === 'string' ? 'yaml' : 'json',
      source: {
        type: sourceUrl ? 'url' : 'upload',
        url: sourceUrl
      },
      rawSpec,
      servers: servers || parsedData.servers || [],
      baseUrl: servers?.[0]?.url || parsedData.servers?.[0]?.url,
      endpointCount: parsedData.endpoints?.length || 0,
      securitySchemes: parsedData.securitySchemes || [],
      tags: parsedData.tags || [],
      version: parsedData.version,
      description: parsedData.description
    });

    await spec.save();

    // Create endpoints if parsed
    if (parsedData.endpoints && parsedData.endpoints.length > 0) {
      const endpointDocs = parsedData.endpoints.map(ep => ({
        ...ep,
        specId: spec._id,
        discoveryMethod: 'spec'
      }));
      await APIEndpoint.insertMany(endpointDocs, { ordered: false }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      data: {
        spec,
        endpointsCreated: parsedData.endpoints?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all specs
exports.getSpecs = async (req, res) => {
  try {
    const { status, specType, limit = 20, page = 1 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (specType) query.specType = specType;

    const specs = await APISpec.find(query)
      .select('-rawSpec')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await APISpec.countDocuments(query);

    res.json({
      success: true,
      data: {
        specs,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single spec
exports.getSpec = async (req, res) => {
  try {
    const spec = await APISpec.findById(req.params.id);
    if (!spec) {
      return res.status(404).json({
        success: false,
        error: 'API spec not found'
      });
    }

    const endpoints = await APIEndpoint.find({ specId: spec._id })
      .select('method path riskLevel vulnerabilityCount requiresAuth');

    res.json({
      success: true,
      data: {
        spec,
        endpoints
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update spec
exports.updateSpec = async (req, res) => {
  try {
    const spec = await APISpec.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!spec) {
      return res.status(404).json({
        success: false,
        error: 'API spec not found'
      });
    }

    res.json({
      success: true,
      data: { spec }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete spec
exports.deleteSpec = async (req, res) => {
  try {
    const spec = await APISpec.findByIdAndDelete(req.params.id);
    if (!spec) {
      return res.status(404).json({
        success: false,
        error: 'API spec not found'
      });
    }

    // Delete associated endpoints and vulnerabilities
    await APIEndpoint.deleteMany({ specId: spec._id });

    res.json({
      success: true,
      message: 'API spec deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Refresh spec from URL
exports.refreshSpec = async (req, res) => {
  try {
    const spec = await APISpec.findById(req.params.id);
    if (!spec) {
      return res.status(404).json({
        success: false,
        error: 'API spec not found'
      });
    }

    if (!spec.source.url) {
      return res.status(400).json({
        success: false,
        error: 'Spec has no source URL'
      });
    }

    // Fetch and parse new spec
    const axios = require('axios');
    const response = await axios.get(spec.source.url);
    const parsedData = await OpenAPIParser.parse(response.data, spec.specType);

    spec.rawSpec = response.data;
    spec.source.lastFetchedAt = new Date();
    spec.endpointCount = parsedData.endpoints?.length || 0;
    spec.securitySchemes = parsedData.securitySchemes || [];
    await spec.save();

    // Update endpoints
    if (parsedData.endpoints) {
      // Remove old endpoints and add new ones
      await APIEndpoint.deleteMany({ specId: spec._id });
      const endpointDocs = parsedData.endpoints.map(ep => ({
        ...ep,
        specId: spec._id,
        discoveryMethod: 'spec'
      }));
      await APIEndpoint.insertMany(endpointDocs, { ordered: false }).catch(() => {});
    }

    res.json({
      success: true,
      data: {
        spec,
        endpointsUpdated: parsedData.endpoints?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Upload and parse new API spec
exports.uploadSpec = async (req, res) => {
  try {
    const { name, url, content, format = 'openapi' } = req.body;

    if (!name || (!url && !content)) {
      return res.status(400).json({
        success: false,
        error: 'Name and either URL or content are required'
      });
    }

    let specContent;
    if (url) {
      // Fetch spec from URL
      const axios = require('axios');
      const response = await axios.get(url);
      specContent = response.data;
    } else {
      specContent = content;
    }

    // Parse and validate spec
    const parsedSpec = await OpenAPIParser.parseSpec(specContent, format);

    // Create spec record
    const spec = new APISpec({
      name,
      url,
      format,
      version: parsedSpec.version || '1.0.0',
      endpoints: parsedSpec.endpoints?.length || 0,
      specData: parsedSpec,
      status: 'active'
    });

    await spec.save();

    // Create endpoint records
    if (parsedSpec.endpoints) {
      const endpoints = parsedSpec.endpoints.map(ep => ({
        specId: spec._id,
        path: ep.path,
        method: ep.method,
        summary: ep.summary,
        description: ep.description,
        parameters: ep.parameters,
        requestBody: ep.requestBody,
        responses: ep.responses,
        requiresAuth: ep.security && ep.security.length > 0,
        deprecated: ep.deprecated || false
      }));

      await APIEndpoint.insertMany(endpoints);
    }

    res.status(201).json({
      success: true,
      data: { spec }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Validate API spec without saving
exports.validateSpec = async (req, res) => {
  try {
    const { content, format = 'openapi' } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Spec content is required'
      });
    }

    const validation = await OpenAPIParser.validateSpec(content, format);

    res.json({
      success: true,
      data: {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
        endpoints: validation.endpoints?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get endpoints from spec
exports.getSpecEndpoints = async (req, res) => {
  try {
    const spec = await APISpec.findById(req.params.id);
    if (!spec) {
      return res.status(404).json({
        success: false,
        error: 'API spec not found'
      });
    }

    const endpoints = await APIEndpoint.find({ specId: spec._id })
      .sort({ path: 1, method: 1 });

    res.json({
      success: true,
      data: { endpoints }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
  try {
    const spec = await APISpec.findById(req.params.id);
    if (!spec) {
      return res.status(404).json({
        success: false,
        error: 'API spec not found'
      });
    }

    const issues = [];
    const endpoints = await APIEndpoint.find({ specId: spec._id });

    // Check for missing authentication
    const unauthEndpoints = endpoints.filter(ep => !ep.requiresAuth);
    if (unauthEndpoints.length > 0) {
      issues.push({
        type: 'missing-auth',
        severity: 'high',
        message: `${unauthEndpoints.length} endpoints have no authentication defined`,
        paths: unauthEndpoints.slice(0, 5).map(e => `${e.method} ${e.path}`)
      });
    }

    // Check for deprecated endpoints
    const deprecatedEndpoints = endpoints.filter(ep => ep.deprecated);
    if (deprecatedEndpoints.length > 0) {
      issues.push({
        type: 'deprecated',
        severity: 'low',
        message: `${deprecatedEndpoints.length} deprecated endpoints found`,
        paths: deprecatedEndpoints.map(e => `${e.method} ${e.path}`)
      });
    }

    // Check for sensitive data in GET parameters
    const sensitiveParams = endpoints.filter(ep => 
      ep.method === 'GET' && 
      ep.parameters?.some(p => 
        ['password', 'token', 'secret', 'key', 'ssn', 'credit_card'].some(
          s => p.name?.toLowerCase().includes(s)
        )
      )
    );
    if (sensitiveParams.length > 0) {
      issues.push({
        type: 'sensitive-data',
        severity: 'high',
        message: 'Sensitive data found in GET parameters',
        paths: sensitiveParams.map(e => `${e.method} ${e.path}`)
      });
    }

    spec.specIssues = issues;
    await spec.save();

    res.json({
      success: true,
      data: {
        issues,
        summary: {
          total: issues.length,
          high: issues.filter(i => i.severity === 'high').length,
          medium: issues.filter(i => i.severity === 'medium').length,
          low: issues.filter(i => i.severity === 'low').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
