/**
 * Email utilities for VictoryKit
 * Uses nodemailer for sending notifications, alerts, and reports
 */

const nodemailer = require('nodemailer');
const pino = require('pino');

const logger = pino({ name: 'email-service' });

// Transporter instance
let transporter = null;

/**
 * Initialize email transporter
 * @param {object} options - SMTP configuration
 */
function initializeEmail(options = {}) {
  const config = {
    host: options.host || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: options.port || parseInt(process.env.SMTP_PORT) || 587,
    secure: options.secure || process.env.SMTP_SECURE === 'true',
    auth: {
      user: options.user || process.env.SMTP_USER,
      pass: options.pass || process.env.SMTP_PASS,
    },
  };
  
  transporter = nodemailer.createTransport(config);
  
  // Verify connection
  transporter.verify((error) => {
    if (error) {
      logger.error({ err: error }, 'Email transporter verification failed');
    } else {
      logger.info('Email transporter ready');
    }
  });
  
  return transporter;
}

/**
 * Send email
 * @param {object} options - Email options
 * @returns {Promise<object>}
 */
async function sendEmail(options) {
  if (!transporter) {
    initializeEmail();
  }
  
  const mailOptions = {
    from: options.from || process.env.SMTP_FROM || 'VictoryKit <noreply@fyzo.xyz>',
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  };
  
  try {
    const result = await transporter.sendMail(mailOptions);
    logger.info({ to: options.to, subject: options.subject, messageId: result.messageId }, 'Email sent');
    return result;
  } catch (error) {
    logger.error({ to: options.to, subject: options.subject, err: error }, 'Failed to send email');
    throw error;
  }
}

// Email templates
const templates = {
  /**
   * Security alert template
   */
  securityAlert: (data) => ({
    subject: `🚨 Security Alert: ${data.alertType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🚨 Security Alert</h1>
        </div>
        <div style="background: #f3f4f6; padding: 20px;">
          <h2 style="color: #dc2626;">${data.alertType}</h2>
          <p><strong>Severity:</strong> ${data.severity}</p>
          <p><strong>Tool:</strong> ${data.tool}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <h3>Details</h3>
            <p>${data.description}</p>
          </div>
          <a href="${data.actionUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            View Details
          </a>
        </div>
        <div style="background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">VictoryKit Security Platform</p>
        </div>
      </div>
    `,
  }),
  
  /**
   * Scan complete template
   */
  scanComplete: (data) => ({
    subject: `✅ Scan Complete: ${data.scanType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">✅ Scan Complete</h1>
        </div>
        <div style="background: #f3f4f6; padding: 20px;">
          <h2>${data.scanType}</h2>
          <p><strong>Target:</strong> ${data.target}</p>
          <p><strong>Duration:</strong> ${data.duration}</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <h3>Summary</h3>
            <ul>
              <li>Critical Issues: ${data.critical || 0}</li>
              <li>High Issues: ${data.high || 0}</li>
              <li>Medium Issues: ${data.medium || 0}</li>
              <li>Low Issues: ${data.low || 0}</li>
            </ul>
          </div>
          <a href="${data.reportUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            View Full Report
          </a>
        </div>
        <div style="background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">VictoryKit Security Platform</p>
        </div>
      </div>
    `,
  }),
  
  /**
   * Daily report template
   */
  dailyReport: (data) => ({
    subject: `📊 Daily Security Report - ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">📊 Daily Security Report</h1>
        </div>
        <div style="background: #f3f4f6; padding: 20px;">
          <p style="color: #6b7280;">Report for ${new Date().toLocaleDateString()}</p>
          
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <h3>Security Score</h3>
            <p style="font-size: 48px; font-weight: bold; color: ${data.score >= 80 ? '#059669' : data.score >= 60 ? '#d97706' : '#dc2626'}; margin: 0;">
              ${data.score}/100
            </p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <h3>Activity Summary</h3>
            <ul>
              <li>Scans Completed: ${data.scansCompleted}</li>
              <li>Threats Blocked: ${data.threatsBlocked}</li>
              <li>Alerts Generated: ${data.alerts}</li>
            </ul>
          </div>
          
          <a href="${data.dashboardUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            View Dashboard
          </a>
        </div>
        <div style="background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">VictoryKit Security Platform</p>
        </div>
      </div>
    `,
  }),
  
  /**
   * Welcome email template
   */
  welcome: (data) => ({
    subject: `🎉 Welcome to VictoryKit!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0;">🎉 Welcome to VictoryKit!</h1>
        </div>
        <div style="background: #f3f4f6; padding: 20px;">
          <p>Hi ${data.name},</p>
          <p>Thank you for joining VictoryKit - your comprehensive cybersecurity platform with 50 powerful tools.</p>
          
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <h3>Getting Started</h3>
            <ol>
              <li>Explore the Dashboard</li>
              <li>Run your first security scan</li>
              <li>Set up alerts and notifications</li>
              <li>Configure your security policies</li>
            </ol>
          </div>
          
          <a href="${data.dashboardUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Go to Dashboard
          </a>
        </div>
        <div style="background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">VictoryKit Security Platform</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Send templated email
 * @param {string} templateName - Template name
 * @param {string} to - Recipient email
 * @param {object} data - Template data
 */
async function sendTemplatedEmail(templateName, to, data) {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Email template "${templateName}" not found`);
  }
  
  const { subject, html } = template(data);
  return sendEmail({ to, subject, html });
}

module.exports = {
  initializeEmail,
  sendEmail,
  sendTemplatedEmail,
  templates,
};
