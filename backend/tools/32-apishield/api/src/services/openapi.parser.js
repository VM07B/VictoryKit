const axios = require('axios');
const SwaggerParser = require('swagger-parser');

class OpenAPIParser {
  constructor() {
    this.supportedFormats = ['openapi-3.0', 'openapi-3.1', 'swagger-2.0', 'graphql', 'grpc'];
  }

  async parse(specContent, specType = 'openapi-3.0') {
    try {
      let parsedSpec;

      if (specType === 'graphql') {
        parsedSpec = await this.parseGraphQL(specContent);
      } else if (specType === 'grpc') {
        parsedSpec = await this.parseGRPC(specContent);
      } else {
        // OpenAPI/Swagger
        parsedSpec = await SwaggerParser.parse(specContent);
      }

      return this.extractEndpoints(parsedSpec, specType);
    } catch (error) {
      throw new Error(`Failed to parse ${specType} spec: ${error.message}`);
    }
  }

  async parseGraphQL(schemaContent) {
    // Basic GraphQL schema parsing
    const queries = [];
    const mutations = [];
    const subscriptions = [];
    const types = [];

    // Extract operations from schema
    const queryMatch = schemaContent.match(/type Query \{([^}]*)\}/s);
    if (queryMatch) {
      queries.push(...this.extractGraphQLOperations(queryMatch[1]));
    }

    const mutationMatch = schemaContent.match(/type Mutation \{([^}]*)\}/s);
    if (mutationMatch) {
      mutations.push(...this.extractGraphQLOperations(mutationMatch[1]));
    }

    const subscriptionMatch = schemaContent.match(/type Subscription \{([^}]*)\}/s);
    if (subscriptionMatch) {
      subscriptions.push(...this.extractGraphQLOperations(subscriptionMatch[1]));
    }

    return {
      queries,
      mutations,
      subscriptions,
      types,
      introspectionEnabled: schemaContent.includes('__schema')
    };
  }

  extractGraphQLOperations(operationsBlock) {
    const operations = [];
    const lines = operationsBlock.split('\n').map(l => l.trim()).filter(l => l);

    for (const line of lines) {
      const match = line.match(/(\w+)\([^)]*\):\s*(\w+)/);
      if (match) {
        operations.push({
          name: match[1],
          returnType: match[2],
          parameters: this.extractGraphQLParams(line)
        });
      }
    }

    return operations;
  }

  extractGraphQLParams(line) {
    const paramMatch = line.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];

    const params = [];
    const paramList = paramMatch[1].split(',').map(p => p.trim());

    for (const param of paramList) {
      const [name, type] = param.split(':').map(p => p.trim());
      if (name && type) {
        params.push({ name, type });
      }
    }

    return params;
  }

  async parseGRPC(protoContent) {
    // Basic gRPC proto parsing
    const services = [];
    const messages = [];

    const serviceMatches = protoContent.match(/service\s+(\w+)\s*\{([^}]*)\}/g);
    if (serviceMatches) {
      for (const serviceMatch of serviceMatches) {
        const serviceName = serviceMatch.match(/service\s+(\w+)/)[1];
        const methods = this.extractGRPCMethods(serviceMatch);
        services.push({ name: serviceName, methods });
      }
    }

    return { services, messages };
  }

  extractGRPCMethods(serviceBlock) {
    const methods = [];
    const methodMatches = serviceBlock.match(/rpc\s+(\w+)\s*\(([^)]*)\)\s*returns\s*\(([^)]*)\)/g);

    if (methodMatches) {
      for (const methodMatch of methodMatches) {
        const [, methodName, inputType, outputType] = methodMatch.match(/rpc\s+(\w+)\s*\(([^)]*)\)\s*returns\s*\(([^)]*)\)/);
        methods.push({
          name: methodName,
          inputType: inputType.trim(),
          outputType: outputType.trim()
        });
      }
    }

    return methods;
  }

  extractEndpoints(parsedSpec, specType) {
    const result = {
      endpoints: [],
      servers: [],
      securitySchemes: {},
      version: '',
      description: '',
      title: ''
    };

    if (specType === 'graphql') {
      // Convert GraphQL to REST-like endpoints
      result.endpoints = this.convertGraphQLToEndpoints(parsedSpec);
      result.version = '1.0';
      result.title = 'GraphQL API';
      return result;
    }

    if (specType === 'grpc') {
      result.endpoints = this.convertGRPCToEndpoints(parsedSpec);
      result.version = '1.0';
      result.title = 'gRPC API';
      return result;
    }

    // OpenAPI/Swagger processing
    result.version = parsedSpec.info?.version || '1.0';
    result.description = parsedSpec.info?.description || '';
    result.title = parsedSpec.info?.title || 'API';
    result.servers = parsedSpec.servers || [];
    result.securitySchemes = parsedSpec.components?.securitySchemes || parsedSpec.securityDefinitions || {};

    // Extract endpoints from paths
    if (parsedSpec.paths) {
      for (const [path, pathItem] of Object.entries(parsedSpec.paths)) {
        for (const [method, operation] of Object.entries(pathItem)) {
          if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method.toLowerCase())) {
            const endpoint = this.createEndpointFromOperation(path, method.toUpperCase(), operation, parsedSpec);
            result.endpoints.push(endpoint);
          }
        }
      }
    }

    return result;
  }

  createEndpointFromOperation(path, method, operation, spec) {
    const endpoint = {
      method,
      path,
      operationId: operation.operationId || `${method.toLowerCase()}${path.replace(/[^a-zA-Z0-9]/g, '')}`,
      summary: operation.summary || '',
      description: operation.description || '',
      tags: operation.tags || [],

      parameters: (operation.parameters || []).map(param => ({
        name: param.name,
        in: param.in,
        required: param.required || false,
        type: param.schema?.type || 'string',
        format: param.schema?.format,
        example: param.example || param.schema?.example
      })),

      requestBody: operation.requestBody ? {
        contentType: Object.keys(operation.requestBody.content || {})[0] || 'application/json',
        schema: operation.requestBody.content?.['application/json']?.schema || {},
        required: operation.requestBody.required || false,
        example: operation.requestBody.content?.['application/json']?.example
      } : null,

      responses: Object.entries(operation.responses || {}).map(([statusCode, response]) => ({
        statusCode,
        description: response.description || '',
        contentType: response.content ? Object.keys(response.content)[0] : null,
        schema: response.content ? response.content[Object.keys(response.content)[0]]?.schema : null
      })),

      security: operation.security || spec.security || [],
      deprecated: operation.deprecated || false,
      requiresAuth: (operation.security || spec.security || []).length > 0
    };

    return endpoint;
  }

  convertGraphQLToEndpoints(graphqlSpec) {
    const endpoints = [];

    // Convert queries to GET endpoints
    for (const query of graphqlSpec.queries || []) {
      endpoints.push({
        method: 'POST',
        path: '/graphql',
        operationId: `query_${query.name}`,
        summary: `GraphQL Query: ${query.name}`,
        description: `Execute GraphQL query: ${query.name}`,
        parameters: query.parameters || [],
        requestBody: {
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              variables: { type: 'object' }
            }
          },
          required: true
        },
        responses: [{
          statusCode: '200',
          description: 'Query executed successfully',
          contentType: 'application/json',
          schema: { type: 'object' }
        }],
        security: [],
        deprecated: false,
        requiresAuth: false
      });
    }

    // Convert mutations to POST endpoints
    for (const mutation of graphqlSpec.mutations || []) {
      endpoints.push({
        method: 'POST',
        path: '/graphql',
        operationId: `mutation_${mutation.name}`,
        summary: `GraphQL Mutation: ${mutation.name}`,
        description: `Execute GraphQL mutation: ${mutation.name}`,
        parameters: mutation.parameters || [],
        requestBody: {
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              variables: { type: 'object' }
            }
          },
          required: true
        },
        responses: [{
          statusCode: '200',
          description: 'Mutation executed successfully',
          contentType: 'application/json',
          schema: { type: 'object' }
        }],
        security: [],
        deprecated: false,
        requiresAuth: false
      });
    }

    return endpoints;
  }

  convertGRPCToEndpoints(grpcSpec) {
    const endpoints = [];

    for (const service of grpcSpec.services || []) {
      for (const method of service.methods || []) {
        endpoints.push({
          method: 'POST',
          path: `/${service.name}/${method.name}`,
          operationId: `${service.name}_${method.name}`,
          summary: `gRPC Method: ${service.name}.${method.name}`,
          description: `Execute gRPC method: ${service.name}.${method.name}`,
          parameters: [],
          requestBody: {
            contentType: 'application/grpc',
            schema: { type: 'object' },
            required: true
          },
          responses: [{
            statusCode: '200',
            description: 'gRPC method executed successfully',
            contentType: 'application/grpc',
            schema: { type: 'object' }
          }],
          security: [],
          deprecated: false,
          requiresAuth: false
        });
      }
    }

    return endpoints;
  }

  // Validate spec format
  validateSpec(specContent, specType) {
    const errors = [];

    try {
      if (specType === 'graphql') {
        if (!specContent.includes('type Query') && !specContent.includes('type Mutation')) {
          errors.push('GraphQL schema must contain Query or Mutation types');
        }
      } else if (specType.startsWith('openapi') || specType.startsWith('swagger')) {
        const spec = JSON.parse(typeof specContent === 'string' ? specContent : JSON.stringify(specContent));
        if (!spec.paths) {
          errors.push('OpenAPI spec must contain paths');
        }
        if (!spec.info) {
          errors.push('OpenAPI spec must contain info section');
        }
      }
    } catch (error) {
      errors.push(`Invalid ${specType} format: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new OpenAPIParser();
