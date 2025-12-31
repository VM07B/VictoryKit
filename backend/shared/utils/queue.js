/**
 * BullMQ queue utilities for VictoryKit
 * Handles background job processing for security scans, reports, etc.
 */

const { Queue, Worker, QueueEvents } = require("bullmq");
const Redis = require("ioredis");
const pino = require("pino");

const logger = pino({ name: "queue-service" });

// Redis connection for BullMQ
const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

connection.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});

connection.on("connect", () => {
  logger.info("Redis connected for queue processing");
});

// Queue definitions
const queues = {
  // Security scan queue
  securityScan: new Queue("security-scan", { connection }),

  // Report generation queue
  reportGeneration: new Queue("report-generation", { connection }),

  // Email notification queue
  emailNotification: new Queue("email-notification", { connection }),

  // Data export queue
  dataExport: new Queue("data-export", { connection }),

  // AI analysis queue
  aiAnalysis: new Queue("ai-analysis", { connection }),
};

// Default job options
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnComplete: {
    age: 24 * 3600, // 24 hours
    count: 1000,
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // 7 days
  },
};

/**
 * Add a job to a queue
 * @param {string} queueName - Name of the queue
 * @param {string} jobName - Job identifier
 * @param {object} data - Job data
 * @param {object} options - Job options
 * @returns {Promise<Job>}
 */
async function addJob(queueName, jobName, data, options = {}) {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue "${queueName}" not found`);
  }

  const job = await queue.add(jobName, data, {
    ...defaultJobOptions,
    ...options,
  });

  logger.info({ queueName, jobName, jobId: job.id }, "Job added to queue");
  return job;
}

/**
 * Create a worker for a queue
 * @param {string} queueName - Name of the queue
 * @param {Function} processor - Job processor function
 * @param {object} options - Worker options
 * @returns {Worker}
 */
function createWorker(queueName, processor, options = {}) {
  const worker = new Worker(
    queueName,
    async (job) => {
      logger.info(
        { queueName, jobId: job.id, jobName: job.name },
        "Processing job"
      );
      try {
        const result = await processor(job);
        logger.info({ queueName, jobId: job.id }, "Job completed");
        return result;
      } catch (error) {
        logger.error({ queueName, jobId: job.id, err: error }, "Job failed");
        throw error;
      }
    },
    {
      connection,
      concurrency: options.concurrency || 5,
      ...options,
    }
  );

  worker.on("failed", (job, err) => {
    logger.error({ queueName, jobId: job?.id, err }, "Job permanently failed");
  });

  return worker;
}

/**
 * Get queue events for monitoring
 * @param {string} queueName - Name of the queue
 * @returns {QueueEvents}
 */
function getQueueEvents(queueName) {
  return new QueueEvents(queueName, { connection });
}

/**
 * Get queue statistics
 * @param {string} queueName - Name of the queue
 * @returns {Promise<object>}
 */
async function getQueueStats(queueName) {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue "${queueName}" not found`);
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

/**
 * Graceful shutdown
 */
async function closeQueues() {
  await Promise.all(Object.values(queues).map((q) => q.close()));
  await connection.quit();
  logger.info("All queues closed");
}

module.exports = {
  queues,
  addJob,
  createWorker,
  getQueueEvents,
  getQueueStats,
  closeQueues,
  connection,
};
