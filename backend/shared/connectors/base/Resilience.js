/**
 * Resilience Patterns for VictoryKit Connectors
 * 
 * - Circuit Breaker
 * - Retry Strategy with backoff
 * - Bulkhead (concurrency limiting)
 * - Timeout handling
 */

const EventEmitter = require('events');

/**
 * Circuit breaker states
 */
const CircuitState = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half-open',
};

/**
 * Circuit Breaker implementation
 * 
 * Prevents cascading failures by opening circuit after threshold failures
 */
class CircuitBreaker extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 30000; // Time before trying half-open
    this.resetTimeout = options.resetTimeout || 60000;
    
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      stateChanges: 0,
    };
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute(fn) {
    this.metrics.totalCalls++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        this.metrics.rejectedCalls++;
        const error = new Error('Circuit breaker is OPEN');
        error.code = 'CIRCUIT_OPEN';
        throw error;
      }
      
      // Try half-open
      this.transitionTo(CircuitState.HALF_OPEN);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  onSuccess() {
    this.metrics.successfulCalls++;
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }
  }

  /**
   * Handle failed execution
   */
  onFailure(error) {
    this.metrics.failedCalls++;
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
    } else if (this.failureCount >= this.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }

    this.emit('failure', { error, failureCount: this.failureCount });
  }

  /**
   * Transition to a new state
   */
  transitionTo(newState) {
    const oldState = this.state;
    this.state = newState;
    this.metrics.stateChanges++;

    if (newState === CircuitState.OPEN) {
      this.nextAttempt = Date.now() + this.timeout;
      this.successCount = 0;
    } else if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
    }

    this.emit('stateChange', { from: oldState, to: newState });
  }

  /**
   * Force reset the circuit
   */
  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    this.emit('reset');
  }

  /**
   * Get circuit status
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
      metrics: { ...this.metrics },
    };
  }
}

/**
 * Retry strategy types
 */
const RetryType = {
  FIXED: 'fixed',
  EXPONENTIAL: 'exponential',
  EXPONENTIAL_JITTER: 'exponential-jitter',
  LINEAR: 'linear',
};

/**
 * Retry Strategy with configurable backoff
 */
class RetryStrategy {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.type = options.type || RetryType.EXPONENTIAL_JITTER;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.jitterFactor = options.jitterFactor || 0.3;
    
    // Retryable error codes/types
    this.retryableErrors = options.retryableErrors || [
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'EPIPE',
      'ENOTFOUND',
      'ENETUNREACH',
      'EAI_AGAIN',
      'RATE_LIMITED',
      'SERVICE_UNAVAILABLE',
    ];
    
    // Status codes that should trigger retry
    this.retryableStatusCodes = options.retryableStatusCodes || [
      408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524,
    ];
  }

  /**
   * Execute with retry
   */
  async execute(fn, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (!this.shouldRetry(error, attempt, maxRetries)) {
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  shouldRetry(error, attempt, maxRetries) {
    if (attempt >= maxRetries) {
      return false;
    }

    // Check error code
    if (error.code && this.retryableErrors.includes(error.code)) {
      return true;
    }

    // Check status code
    if (error.status && this.retryableStatusCodes.includes(error.status)) {
      return true;
    }

    if (error.response?.status && this.retryableStatusCodes.includes(error.response.status)) {
      return true;
    }

    // Check for explicit retry flag
    if (error.retryable === true) {
      return true;
    }

    return false;
  }

  /**
   * Calculate delay for next retry
   */
  calculateDelay(attempt) {
    let delay;

    switch (this.type) {
      case RetryType.FIXED:
        delay = this.baseDelay;
        break;

      case RetryType.LINEAR:
        delay = this.baseDelay * (attempt + 1);
        break;

      case RetryType.EXPONENTIAL:
        delay = this.baseDelay * Math.pow(2, attempt);
        break;

      case RetryType.EXPONENTIAL_JITTER:
      default:
        delay = this.baseDelay * Math.pow(2, attempt);
        // Add jitter: +/- jitterFactor
        const jitter = delay * this.jitterFactor * (Math.random() * 2 - 1);
        delay += jitter;
        break;
    }

    return Math.min(delay, this.maxDelay);
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Bulkhead pattern for concurrency limiting
 */
class Bulkhead {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 10;
    this.maxQueue = options.maxQueue || 100;
    
    this.activeCount = 0;
    this.queue = [];
    
    this.metrics = {
      accepted: 0,
      rejected: 0,
      completed: 0,
      failed: 0,
      queued: 0,
    };
  }

  /**
   * Execute through bulkhead
   */
  async execute(fn) {
    if (this.activeCount >= this.maxConcurrent) {
      if (this.queue.length >= this.maxQueue) {
        this.metrics.rejected++;
        const error = new Error('Bulkhead queue is full');
        error.code = 'BULKHEAD_FULL';
        throw error;
      }

      // Add to queue
      return new Promise((resolve, reject) => {
        this.queue.push({ fn, resolve, reject });
        this.metrics.queued++;
      });
    }

    return this.executeNow(fn);
  }

  /**
   * Execute immediately
   */
  async executeNow(fn) {
    this.activeCount++;
    this.metrics.accepted++;

    try {
      const result = await fn();
      this.metrics.completed++;
      return result;
    } catch (error) {
      this.metrics.failed++;
      throw error;
    } finally {
      this.activeCount--;
      this.processQueue();
    }
  }

  /**
   * Process next item in queue
   */
  processQueue() {
    if (this.queue.length === 0 || this.activeCount >= this.maxConcurrent) {
      return;
    }

    const { fn, resolve, reject } = this.queue.shift();
    
    this.executeNow(fn)
      .then(resolve)
      .catch(reject);
  }

  /**
   * Get bulkhead status
   */
  getStatus() {
    return {
      activeCount: this.activeCount,
      queueLength: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      maxQueue: this.maxQueue,
      metrics: { ...this.metrics },
    };
  }
}

/**
 * Timeout wrapper
 */
class TimeoutWrapper {
  constructor(defaultTimeout = 30000) {
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * Execute with timeout
   */
  async execute(fn, timeout = this.defaultTimeout) {
    return Promise.race([
      fn(),
      new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error(`Operation timed out after ${timeout}ms`);
          error.code = 'TIMEOUT';
          reject(error);
        }, timeout);
      }),
    ]);
  }
}

/**
 * Combined resilience wrapper
 */
class ResilienceWrapper {
  constructor(options = {}) {
    this.circuitBreaker = options.circuitBreaker || new CircuitBreaker(options.circuit);
    this.retryStrategy = options.retryStrategy || new RetryStrategy(options.retry);
    this.bulkhead = options.bulkhead || new Bulkhead(options.bulk);
    this.timeout = options.timeout || new TimeoutWrapper(options.timeoutMs);
  }

  /**
   * Execute with all resilience patterns
   */
  async execute(fn, options = {}) {
    const timeoutMs = options.timeout || this.timeout.defaultTimeout;

    // Bulkhead -> Circuit Breaker -> Retry -> Timeout -> Function
    return this.bulkhead.execute(() =>
      this.circuitBreaker.execute(() =>
        this.retryStrategy.execute(() =>
          this.timeout.execute(fn, timeoutMs)
        )
      )
    );
  }

  /**
   * Get status of all resilience patterns
   */
  getStatus() {
    return {
      circuitBreaker: this.circuitBreaker.getStatus(),
      bulkhead: this.bulkhead.getStatus(),
    };
  }
}

module.exports = {
  CircuitBreaker,
  CircuitState,
  RetryStrategy,
  RetryType,
  Bulkhead,
  TimeoutWrapper,
  ResilienceWrapper,
};
