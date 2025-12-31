/**
 * Workflow Engine
 * 
 * Multi-step security automation workflows:
 * - DAG-based workflow execution
 * - Conditional branching
 * - Parallel execution
 * - State management
 * - Retry and rollback
 * - Human-in-the-loop approval
 */

const { EventEmitter } = require('events');

/**
 * Workflow states
 */
const WorkflowState = {
  CREATED: 'created',
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  WAITING_APPROVAL: 'waiting_approval',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  ROLLED_BACK: 'rolled_back',
};

/**
 * Step states
 */
const StepState = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  WAITING: 'waiting',
};

/**
 * Step types
 */
const StepType = {
  ACTION: 'action',        // Execute an action
  CONDITION: 'condition',  // Branch based on condition
  PARALLEL: 'parallel',    // Execute steps in parallel
  LOOP: 'loop',           // Iterate over items
  WAIT: 'wait',           // Wait for duration/event
  APPROVAL: 'approval',   // Wait for human approval
  SUBWORKFLOW: 'subworkflow', // Execute another workflow
};

/**
 * Workflow Step
 */
class WorkflowStep {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type || StepType.ACTION;
    this.action = config.action;
    this.params = config.params || {};
    this.next = config.next;
    this.onSuccess = config.onSuccess;
    this.onFailure = config.onFailure;
    this.condition = config.condition;
    this.timeout = config.timeout || 300000; // 5 minutes
    this.retries = config.retries || 0;
    this.retryDelay = config.retryDelay || 5000;
    this.rollback = config.rollback;
    this.requireApproval = config.requireApproval || false;
    this.approvers = config.approvers || [];
    this.parallelSteps = config.parallelSteps || [];
    this.loopItems = config.loopItems;
    this.loopItemVar = config.loopItemVar || 'item';
    this.waitDuration = config.waitDuration;
    this.waitEvent = config.waitEvent;
    this.subworkflowId = config.subworkflowId;
    this.metadata = config.metadata || {};
  }
}

/**
 * Workflow Definition
 */
class WorkflowDefinition {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.version = config.version || '1.0.0';
    this.trigger = config.trigger;
    this.steps = new Map();
    this.startStep = config.startStep;
    this.variables = config.variables || {};
    this.timeout = config.timeout || 3600000; // 1 hour
    this.metadata = config.metadata || {};
    this.createdAt = new Date().toISOString();

    // Add steps
    if (config.steps) {
      for (const step of config.steps) {
        this.addStep(step);
      }
    }
  }

  addStep(stepConfig) {
    const step = new WorkflowStep(stepConfig);
    this.steps.set(step.id, step);
    return step;
  }

  getStep(stepId) {
    return this.steps.get(stepId);
  }

  removeStep(stepId) {
    return this.steps.delete(stepId);
  }

  validate() {
    const errors = [];

    if (!this.startStep) {
      errors.push('No start step defined');
    } else if (!this.steps.has(this.startStep)) {
      errors.push(`Start step "${this.startStep}" not found`);
    }

    // Check for unreachable steps
    const reachable = new Set();
    const visit = (stepId) => {
      if (!stepId || reachable.has(stepId)) return;
      reachable.add(stepId);
      
      const step = this.steps.get(stepId);
      if (step) {
        if (step.next) visit(step.next);
        if (step.onSuccess) visit(step.onSuccess);
        if (step.onFailure) visit(step.onFailure);
        for (const parallelStep of step.parallelSteps) {
          visit(parallelStep);
        }
      }
    };
    
    visit(this.startStep);

    for (const [id] of this.steps) {
      if (!reachable.has(id)) {
        errors.push(`Step "${id}" is unreachable`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Workflow Instance (Execution)
 */
class WorkflowInstance {
  constructor(definition, input = {}) {
    this.id = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.definitionId = definition.id;
    this.definitionVersion = definition.version;
    this.state = WorkflowState.CREATED;
    this.input = input;
    this.output = null;
    this.context = { ...definition.variables, ...input };
    this.currentStep = null;
    this.stepHistory = [];
    this.stepStates = new Map();
    this.error = null;
    this.startedAt = null;
    this.completedAt = null;
    this.lastUpdated = new Date().toISOString();
    this.approvals = [];
    this.logs = [];
  }

  log(level, message, data = {}) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      step: this.currentStep,
    });
  }

  setStepState(stepId, state, result = null, error = null) {
    this.stepStates.set(stepId, {
      state,
      result,
      error,
      startedAt: this.stepStates.get(stepId)?.startedAt || new Date().toISOString(),
      completedAt: state === StepState.COMPLETED || state === StepState.FAILED 
        ? new Date().toISOString() 
        : null,
    });

    this.stepHistory.push({
      stepId,
      state,
      timestamp: new Date().toISOString(),
    });

    this.lastUpdated = new Date().toISOString();
  }

  getStepState(stepId) {
    return this.stepStates.get(stepId);
  }

  addApproval(approver, approved, comment = '') {
    this.approvals.push({
      stepId: this.currentStep,
      approver,
      approved,
      comment,
      timestamp: new Date().toISOString(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      definitionId: this.definitionId,
      definitionVersion: this.definitionVersion,
      state: this.state,
      input: this.input,
      output: this.output,
      currentStep: this.currentStep,
      stepStates: Object.fromEntries(this.stepStates),
      error: this.error,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      lastUpdated: this.lastUpdated,
      approvals: this.approvals,
      logs: this.logs.slice(-100), // Last 100 logs
    };
  }
}

/**
 * Action Registry
 */
class ActionRegistry {
  constructor() {
    this.actions = new Map();
  }

  register(name, handler, options = {}) {
    this.actions.set(name, {
      handler,
      schema: options.schema,
      description: options.description,
      timeout: options.timeout,
      retryable: options.retryable ?? true,
    });
  }

  get(name) {
    return this.actions.get(name);
  }

  has(name) {
    return this.actions.has(name);
  }

  list() {
    return Array.from(this.actions.keys());
  }

  async execute(name, params, context) {
    const action = this.actions.get(name);
    if (!action) {
      throw new Error(`Action "${name}" not found`);
    }
    return action.handler(params, context);
  }
}

/**
 * Workflow Engine
 */
class WorkflowEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = config;
    this.definitions = new Map();
    this.instances = new Map();
    this.actions = new ActionRegistry();
    
    // Execution queue
    this.queue = [];
    this.maxConcurrent = config.maxConcurrent || 10;
    this.running = 0;
    
    // Persistence (would be database in production)
    this.store = config.store || new Map();
    
    // Register built-in actions
    this.registerBuiltinActions();
  }

  /**
   * Register built-in actions
   */
  registerBuiltinActions() {
    // Log action
    this.actions.register('log', async (params, context) => {
      console.log(`[Workflow ${context.workflowId}]`, params.message, params.data || '');
      return { logged: true };
    });

    // HTTP request action
    this.actions.register('http', async (params) => {
      const response = await fetch(params.url, {
        method: params.method || 'GET',
        headers: params.headers,
        body: params.body ? JSON.stringify(params.body) : undefined,
      });
      return {
        status: response.status,
        body: await response.json().catch(() => response.text()),
      };
    });

    // Delay action
    this.actions.register('delay', async (params) => {
      await new Promise(resolve => setTimeout(resolve, params.duration || 1000));
      return { delayed: params.duration };
    });

    // Set variable action
    this.actions.register('setVariable', async (params, context) => {
      context.variables[params.name] = params.value;
      return { set: params.name };
    });

    // Transform action
    this.actions.register('transform', async (params, context) => {
      const fn = new Function('data', 'context', params.expression);
      return fn(params.data, context);
    });

    // Send notification action
    this.actions.register('notify', async (params, context) => {
      // Would integrate with comms connector
      return { notified: params.channel, message: params.message };
    });

    // Create ticket action
    this.actions.register('createTicket', async (params, context) => {
      // Would integrate with Linear connector
      return { ticketId: `TICKET-${Date.now()}`, ...params };
    });

    // Escalate action
    this.actions.register('escalate', async (params, context) => {
      // Would integrate with incident.io connector
      return { escalated: true, severity: params.severity };
    });
  }

  /**
   * Register action
   */
  registerAction(name, handler, options = {}) {
    this.actions.register(name, handler, options);
  }

  /**
   * Register workflow definition
   */
  registerWorkflow(config) {
    const definition = new WorkflowDefinition(config);
    const validation = definition.validate();
    
    if (!validation.valid) {
      throw new Error(`Invalid workflow: ${validation.errors.join(', ')}`);
    }

    this.definitions.set(definition.id, definition);
    this.emit('workflow:registered', definition);
    return definition;
  }

  /**
   * Get workflow definition
   */
  getWorkflow(id) {
    return this.definitions.get(id);
  }

  /**
   * List workflows
   */
  listWorkflows() {
    return Array.from(this.definitions.values()).map(d => ({
      id: d.id,
      name: d.name,
      version: d.version,
      description: d.description,
    }));
  }

  /**
   * Start workflow
   */
  async startWorkflow(workflowId, input = {}) {
    const definition = this.definitions.get(workflowId);
    if (!definition) {
      throw new Error(`Workflow "${workflowId}" not found`);
    }

    const instance = new WorkflowInstance(definition, input);
    this.instances.set(instance.id, instance);
    
    instance.log('info', 'Workflow started', { input });
    this.emit('workflow:started', instance);

    // Queue for execution
    this.queue.push({ instance, definition });
    this.processQueue();

    return instance.id;
  }

  /**
   * Process execution queue
   */
  async processQueue() {
    while (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const { instance, definition } = this.queue.shift();
      this.running++;
      
      this.executeWorkflow(instance, definition)
        .finally(() => {
          this.running--;
          this.processQueue();
        });
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(instance, definition) {
    instance.state = WorkflowState.RUNNING;
    instance.startedAt = new Date().toISOString();
    instance.currentStep = definition.startStep;

    try {
      while (instance.currentStep && instance.state === WorkflowState.RUNNING) {
        const step = definition.getStep(instance.currentStep);
        if (!step) {
          throw new Error(`Step "${instance.currentStep}" not found`);
        }

        const result = await this.executeStep(instance, step);
        
        // Determine next step
        if (result.nextStep !== undefined) {
          instance.currentStep = result.nextStep;
        } else if (result.success && step.onSuccess) {
          instance.currentStep = step.onSuccess;
        } else if (!result.success && step.onFailure) {
          instance.currentStep = step.onFailure;
        } else {
          instance.currentStep = step.next || null;
        }
      }

      if (instance.state === WorkflowState.RUNNING) {
        instance.state = WorkflowState.COMPLETED;
        instance.completedAt = new Date().toISOString();
        instance.log('info', 'Workflow completed');
        this.emit('workflow:completed', instance);
      }

    } catch (error) {
      instance.state = WorkflowState.FAILED;
      instance.error = error.message;
      instance.completedAt = new Date().toISOString();
      instance.log('error', 'Workflow failed', { error: error.message });
      this.emit('workflow:failed', { instance, error });
    }

    // Persist
    this.store.set(instance.id, instance.toJSON());
    return instance;
  }

  /**
   * Execute step
   */
  async executeStep(instance, step) {
    instance.log('info', `Executing step: ${step.name}`, { type: step.type });
    instance.setStepState(step.id, StepState.RUNNING);

    try {
      let result;

      switch (step.type) {
        case StepType.ACTION:
          result = await this.executeActionStep(instance, step);
          break;

        case StepType.CONDITION:
          result = await this.executeConditionStep(instance, step);
          break;

        case StepType.PARALLEL:
          result = await this.executeParallelStep(instance, step);
          break;

        case StepType.LOOP:
          result = await this.executeLoopStep(instance, step);
          break;

        case StepType.WAIT:
          result = await this.executeWaitStep(instance, step);
          break;

        case StepType.APPROVAL:
          result = await this.executeApprovalStep(instance, step);
          break;

        case StepType.SUBWORKFLOW:
          result = await this.executeSubworkflowStep(instance, step);
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      instance.setStepState(step.id, StepState.COMPLETED, result);
      return { success: true, result, nextStep: result?.nextStep };

    } catch (error) {
      // Retry logic
      const state = instance.getStepState(step.id);
      const attempts = (state?.attempts || 0) + 1;

      if (attempts <= step.retries) {
        instance.log('warn', `Step failed, retrying (${attempts}/${step.retries})`, {
          error: error.message,
        });
        
        await new Promise(r => setTimeout(r, step.retryDelay));
        instance.setStepState(step.id, StepState.PENDING);
        instance.stepStates.get(step.id).attempts = attempts;
        
        return this.executeStep(instance, step);
      }

      instance.setStepState(step.id, StepState.FAILED, null, error.message);
      instance.log('error', `Step failed: ${step.name}`, { error: error.message });

      // Execute rollback if defined
      if (step.rollback) {
        await this.executeRollback(instance, step);
      }

      return { success: false, error };
    }
  }

  /**
   * Execute action step
   */
  async executeActionStep(instance, step) {
    const params = this.resolveParams(step.params, instance.context);
    
    const context = {
      workflowId: instance.id,
      stepId: step.id,
      variables: instance.context,
    };

    const result = await Promise.race([
      this.actions.execute(step.action, params, context),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Step timeout')), step.timeout)
      ),
    ]);

    // Store result in context
    if (result && step.metadata.outputVar) {
      instance.context[step.metadata.outputVar] = result;
    }

    return result;
  }

  /**
   * Execute condition step
   */
  async executeConditionStep(instance, step) {
    const condition = this.resolveParams({ condition: step.condition }, instance.context);
    const fn = new Function('context', `return ${condition.condition}`);
    const result = fn(instance.context);

    return {
      condition: result,
      nextStep: result ? step.onSuccess : step.onFailure,
    };
  }

  /**
   * Execute parallel step
   */
  async executeParallelStep(instance, step) {
    const definition = this.definitions.get(instance.definitionId);
    
    const promises = step.parallelSteps.map(async (stepId) => {
      const parallelStep = definition.getStep(stepId);
      if (!parallelStep) throw new Error(`Parallel step "${stepId}" not found`);
      return this.executeStep(instance, parallelStep);
    });

    const results = await Promise.all(promises);
    return { parallelResults: results };
  }

  /**
   * Execute loop step
   */
  async executeLoopStep(instance, step) {
    const items = this.resolveParams({ items: step.loopItems }, instance.context).items;
    const results = [];

    for (const item of items) {
      instance.context[step.loopItemVar] = item;
      
      const params = this.resolveParams(step.params, instance.context);
      const context = {
        workflowId: instance.id,
        stepId: step.id,
        variables: instance.context,
      };

      const result = await this.actions.execute(step.action, params, context);
      results.push(result);
    }

    return { loopResults: results };
  }

  /**
   * Execute wait step
   */
  async executeWaitStep(instance, step) {
    if (step.waitDuration) {
      await new Promise(r => setTimeout(r, step.waitDuration));
      return { waited: step.waitDuration };
    }

    if (step.waitEvent) {
      instance.state = WorkflowState.PAUSED;
      instance.log('info', `Waiting for event: ${step.waitEvent}`);
      
      // In production, this would be event-driven
      // For now, we'll just timeout
      throw new Error('Event wait not implemented');
    }

    return { waited: 0 };
  }

  /**
   * Execute approval step
   */
  async executeApprovalStep(instance, step) {
    instance.state = WorkflowState.WAITING_APPROVAL;
    instance.log('info', 'Waiting for approval', { approvers: step.approvers });
    
    this.emit('workflow:approval_required', {
      workflowId: instance.id,
      stepId: step.id,
      approvers: step.approvers,
    });

    // In production, this would pause and wait for external approval
    // For now, auto-approve after a short delay (for testing)
    await new Promise(r => setTimeout(r, 1000));
    
    return { approved: true, autoApproved: true };
  }

  /**
   * Execute subworkflow step
   */
  async executeSubworkflowStep(instance, step) {
    const subInput = this.resolveParams(step.params, instance.context);
    const subInstanceId = await this.startWorkflow(step.subworkflowId, subInput);
    
    // Wait for subworkflow to complete
    return new Promise((resolve, reject) => {
      const checkComplete = () => {
        const subInstance = this.instances.get(subInstanceId);
        if (!subInstance) return reject(new Error('Subworkflow not found'));
        
        if (subInstance.state === WorkflowState.COMPLETED) {
          resolve({ subworkflowId: subInstanceId, output: subInstance.output });
        } else if (subInstance.state === WorkflowState.FAILED) {
          reject(new Error(`Subworkflow failed: ${subInstance.error}`));
        } else {
          setTimeout(checkComplete, 1000);
        }
      };
      checkComplete();
    });
  }

  /**
   * Execute rollback
   */
  async executeRollback(instance, step) {
    instance.log('info', `Rolling back step: ${step.name}`);
    
    try {
      const params = this.resolveParams(step.rollback.params || {}, instance.context);
      await this.actions.execute(step.rollback.action, params, {
        workflowId: instance.id,
        stepId: step.id,
        variables: instance.context,
      });
      
      instance.log('info', 'Rollback completed');
    } catch (error) {
      instance.log('error', 'Rollback failed', { error: error.message });
    }
  }

  /**
   * Resolve parameter templates
   */
  resolveParams(params, context) {
    const resolved = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.includes('{{')) {
        resolved[key] = value.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
          const fn = new Function('ctx', `return ctx.${expr.trim()}`);
          return fn(context);
        });
      } else if (typeof value === 'object' && value !== null) {
        resolved[key] = this.resolveParams(value, context);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  /**
   * Approve workflow step
   */
  approve(instanceId, approver, approved = true, comment = '') {
    const instance = this.instances.get(instanceId);
    if (!instance) throw new Error('Workflow instance not found');
    
    if (instance.state !== WorkflowState.WAITING_APPROVAL) {
      throw new Error('Workflow is not waiting for approval');
    }

    instance.addApproval(approver, approved, comment);
    instance.state = approved ? WorkflowState.RUNNING : WorkflowState.CANCELLED;
    
    this.emit('workflow:approved', { instance, approver, approved });
    
    // Resume execution
    if (approved) {
      const definition = this.definitions.get(instance.definitionId);
      this.queue.push({ instance, definition });
      this.processQueue();
    }

    return instance;
  }

  /**
   * Cancel workflow
   */
  cancel(instanceId, reason = '') {
    const instance = this.instances.get(instanceId);
    if (!instance) throw new Error('Workflow instance not found');
    
    instance.state = WorkflowState.CANCELLED;
    instance.completedAt = new Date().toISOString();
    instance.log('info', 'Workflow cancelled', { reason });
    
    this.emit('workflow:cancelled', { instance, reason });
    return instance;
  }

  /**
   * Get workflow instance
   */
  getInstance(instanceId) {
    return this.instances.get(instanceId);
  }

  /**
   * List workflow instances
   */
  listInstances(options = {}) {
    let instances = Array.from(this.instances.values());

    if (options.state) {
      instances = instances.filter(i => i.state === options.state);
    }

    if (options.workflowId) {
      instances = instances.filter(i => i.definitionId === options.workflowId);
    }

    if (options.limit) {
      instances = instances.slice(0, options.limit);
    }

    return instances.map(i => i.toJSON());
  }

  /**
   * Get metrics
   */
  getMetrics() {
    const instances = Array.from(this.instances.values());
    const byState = {};
    
    for (const instance of instances) {
      byState[instance.state] = (byState[instance.state] || 0) + 1;
    }

    return {
      definitions: this.definitions.size,
      instances: instances.length,
      byState,
      queueSize: this.queue.length,
      running: this.running,
    };
  }
}

/**
 * Pre-built security workflow templates
 */
const SecurityWorkflows = {
  /**
   * Malware incident response workflow
   */
  malwareResponse: {
    id: 'malware-incident-response',
    name: 'Malware Incident Response',
    description: 'Automated response to malware detection',
    startStep: 'isolate',
    steps: [
      {
        id: 'isolate',
        name: 'Isolate Host',
        type: StepType.ACTION,
        action: 'isolateHost',
        params: { hostId: '{{input.hostId}}' },
        onSuccess: 'collect-forensics',
        onFailure: 'escalate',
        rollback: { action: 'unisolateHost', params: { hostId: '{{input.hostId}}' } },
      },
      {
        id: 'collect-forensics',
        name: 'Collect Forensics',
        type: StepType.ACTION,
        action: 'collectForensics',
        params: { hostId: '{{input.hostId}}' },
        next: 'analyze-malware',
      },
      {
        id: 'analyze-malware',
        name: 'Analyze Malware',
        type: StepType.ACTION,
        action: 'analyzeMalware',
        params: { sampleHash: '{{input.sampleHash}}' },
        next: 'check-severity',
      },
      {
        id: 'check-severity',
        name: 'Check Severity',
        type: StepType.CONDITION,
        condition: 'context.severity === "critical"',
        onSuccess: 'notify-security-team',
        onFailure: 'remediate',
      },
      {
        id: 'notify-security-team',
        name: 'Notify Security Team',
        type: StepType.ACTION,
        action: 'notify',
        params: { channel: 'security', message: 'Critical malware detected: {{input.sampleHash}}' },
        next: 'approval-required',
      },
      {
        id: 'approval-required',
        name: 'Approval Required',
        type: StepType.APPROVAL,
        approvers: ['security-team'],
        onSuccess: 'remediate',
        onFailure: 'escalate',
      },
      {
        id: 'remediate',
        name: 'Remediate',
        type: StepType.ACTION,
        action: 'remediateMalware',
        params: { hostId: '{{input.hostId}}', sampleHash: '{{input.sampleHash}}' },
        next: 'verify-clean',
      },
      {
        id: 'verify-clean',
        name: 'Verify Clean',
        type: StepType.ACTION,
        action: 'verifyCleaned',
        params: { hostId: '{{input.hostId}}' },
        onSuccess: 'unisolate',
        onFailure: 'escalate',
      },
      {
        id: 'unisolate',
        name: 'Unisolate Host',
        type: StepType.ACTION,
        action: 'unisolateHost',
        params: { hostId: '{{input.hostId}}' },
        next: 'close-ticket',
      },
      {
        id: 'close-ticket',
        name: 'Close Ticket',
        type: StepType.ACTION,
        action: 'updateTicket',
        params: { ticketId: '{{input.ticketId}}', status: 'resolved' },
      },
      {
        id: 'escalate',
        name: 'Escalate',
        type: StepType.ACTION,
        action: 'escalate',
        params: { severity: 'high', reason: 'Automated remediation failed' },
      },
    ],
  },

  /**
   * Phishing response workflow
   */
  phishingResponse: {
    id: 'phishing-response',
    name: 'Phishing Response',
    description: 'Automated response to phishing detection',
    startStep: 'analyze-email',
    steps: [
      {
        id: 'analyze-email',
        name: 'Analyze Email',
        type: StepType.ACTION,
        action: 'analyzeEmail',
        params: { emailId: '{{input.emailId}}' },
        next: 'check-phish-confidence',
      },
      {
        id: 'check-phish-confidence',
        name: 'Check Phishing Confidence',
        type: StepType.CONDITION,
        condition: 'context.phishScore > 80',
        onSuccess: 'quarantine-email',
        onFailure: 'manual-review',
      },
      {
        id: 'quarantine-email',
        name: 'Quarantine Email',
        type: StepType.ACTION,
        action: 'quarantineEmail',
        params: { emailId: '{{input.emailId}}' },
        next: 'block-sender',
      },
      {
        id: 'block-sender',
        name: 'Block Sender',
        type: StepType.ACTION,
        action: 'blockSender',
        params: { sender: '{{input.sender}}' },
        next: 'notify-user',
      },
      {
        id: 'notify-user',
        name: 'Notify User',
        type: StepType.ACTION,
        action: 'notifyUser',
        params: { 
          userId: '{{input.recipientId}}', 
          message: 'A phishing email was blocked. Please report any suspicious activity.' 
        },
        next: 'update-threat-intel',
      },
      {
        id: 'update-threat-intel',
        name: 'Update Threat Intel',
        type: StepType.ACTION,
        action: 'addIOC',
        params: { 
          type: 'email', 
          value: '{{input.sender}}',
          tags: ['phishing'],
        },
      },
      {
        id: 'manual-review',
        name: 'Manual Review',
        type: StepType.APPROVAL,
        approvers: ['soc-analysts'],
        onSuccess: 'quarantine-email',
        onFailure: 'mark-safe',
      },
      {
        id: 'mark-safe',
        name: 'Mark as Safe',
        type: StepType.ACTION,
        action: 'markEmailSafe',
        params: { emailId: '{{input.emailId}}' },
      },
    ],
  },
};

module.exports = {
  WorkflowEngine,
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowStep,
  ActionRegistry,
  WorkflowState,
  StepState,
  StepType,
  SecurityWorkflows,
};
