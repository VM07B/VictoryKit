/**
 * Alert Service
 * Business logic for alert operations
 */

const LogEntry = require("../models/LogEntry");

class AlertService {
  async testAlert(alert) {
    try {
      // Build query from alert conditions
      const query = { userId: alert.userId };

      for (const condition of alert.conditions) {
        switch (condition.operator) {
          case "equals":
            query[condition.field] = condition.value;
            break;
          case "contains":
            query[condition.field] = new RegExp(
              condition.value,
              condition.caseSensitive ? "g" : "gi"
            );
            break;
          case "regex":
            query[condition.field] = new RegExp(
              condition.value,
              condition.caseSensitive ? "g" : "gi"
            );
            break;
          case "greater":
            query[condition.field] = { $gt: condition.value };
            break;
          case "less":
            query[condition.field] = { $lt: condition.value };
            break;
          case "between":
            query[condition.field] = {
              $gte: condition.value[0],
              $lte: condition.value[1],
            };
            break;
        }
      }

      // Check if any log entries match
      const matchingLogs = await LogEntry.find(query).limit(5);

      return {
        triggered: matchingLogs.length > 0,
        matchingLogs: matchingLogs.length,
        sampleMatches: matchingLogs.slice(0, 3),
      };
    } catch (error) {
      console.error("Alert test error:", error);
      return {
        triggered: false,
        error: error.message,
      };
    }
  }

  async checkAlerts(userId) {
    try {
      const LogAlert = require("../models/LogAlert");
      const alerts = await LogAlert.find({ userId, enabled: true });

      const triggeredAlerts = [];

      for (const alert of alerts) {
        // Check cooldown
        if (alert.lastTriggered) {
          const cooldownMs = alert.cooldown * 60 * 1000;
          const timeSinceLastTrigger =
            Date.now() - alert.lastTriggered.getTime();
          if (timeSinceLastTrigger < cooldownMs) {
            continue; // Still in cooldown
          }
        }

        const testResult = await this.testAlert(alert);
        if (testResult.triggered) {
          triggeredAlerts.push({
            alert,
            matches: testResult.matchingLogs,
          });

          // Update alert
          await LogAlert.findByIdAndUpdate(alert._id, {
            lastTriggered: new Date(),
            $inc: { triggerCount: 1 },
          });
        }
      }

      return triggeredAlerts;
    } catch (error) {
      console.error("Alert check error:", error);
      return [];
    }
  }

  async sendAlertNotifications(triggeredAlerts) {
    // Implementation for sending notifications via email, webhook, etc.
    for (const { alert, matches } of triggeredAlerts) {
      for (const action of alert.actions) {
        if (!action.enabled) continue;

        switch (action.type) {
          case "email":
            await this.sendEmailAlert(alert, matches, action);
            break;
          case "webhook":
            await this.sendWebhookAlert(alert, matches, action);
            break;
          case "slack":
            await this.sendSlackAlert(alert, matches, action);
            break;
          // Add more notification types...
        }
      }
    }
  }

  async sendEmailAlert(alert, matches, action) {
    // Email sending implementation
    console.log(`Sending email alert to ${action.target}: ${alert.name}`);
  }

  async sendWebhookAlert(alert, matches, action) {
    // Webhook implementation
    console.log(`Sending webhook alert to ${action.target}: ${alert.name}`);
  }

  async sendSlackAlert(alert, matches, action) {
    // Slack implementation
    console.log(`Sending Slack alert to ${action.target}: ${alert.name}`);
  }
}

module.exports = new AlertService();
