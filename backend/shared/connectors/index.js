/**
 * VictoryKit Connector Registry
 * 
 * Enterprise-grade connectors for the chosen stack:
 * - Microsoft Sentinel (SIEM)
 * - Cortex XSOAR (SOAR)
 * - Okta (IdP)
 * - Kong (API Gateway)
 * - Cloudflare (WAF/CDN)
 * - CrowdStrike Falcon (EDR)
 * - Wiz (CSPM)
 * - Redpanda (Message Bus)
 * - OpenCTI (TIP)
 * - Linear (Ticketing)
 * - Slack + Discord (Comms)
 * - incident.io (Alerting)
 * - Vanta (GRC)
 * - Infisical (Secrets)
 * - Zeek/Suricata (Network)
 * - Cape Sandbox (Malware)
 * - OPA/Cedar (Policy)
 */

// Base infrastructure
const { BaseConnector, ConnectorRegistry } = require('./base/BaseConnector');
const { EventSchema, SchemaRegistry } = require('./base/SchemaRegistry');
const { RetryStrategy, CircuitBreaker } = require('./base/Resilience');

// Message Bus
const { RedpandaConnector, RedpandaProducer, RedpandaConsumer } = require('./messaging/RedpandaConnector');

// SIEM & SOAR
const { SentinelConnector } = require('./siem/SentinelConnector');
const { CortexXSOARConnector } = require('./soar/CortexXSOARConnector');

// Identity & Access
const { OktaConnector } = require('./identity/OktaConnector');
const { CedarPolicyEngine, OPAConnector } = require('./policy/PolicyConnector');

// Network & Edge
const { KongConnector } = require('./gateway/KongConnector');
const { CloudflareConnector } = require('./cdn/CloudflareConnector');
const { ZeekConnector, SuricataConnector } = require('./network/NetworkConnector');

// Endpoint & Cloud
const { CrowdStrikeConnector } = require('./edr/CrowdStrikeConnector');
const { WizConnector } = require('./cspm/WizConnector');
const { CapeSandboxConnector } = require('./sandbox/CapeSandboxConnector');

// Threat Intelligence
const { OpenCTIConnector } = require('./threatintel/OpenCTIConnector');

// Collaboration & Alerting
const { LinearConnector } = require('./ticketing/LinearConnector');
const { SlackConnector, DiscordConnector } = require('./comms/CommsConnector');
const { IncidentIOConnector } = require('./alerting/IncidentIOConnector');

// Compliance & Secrets
const { VantaConnector } = require('./grc/VantaConnector');
const { InfisicalConnector } = require('./secrets/InfisicalConnector');

// Global registry instance
const registry = new ConnectorRegistry();

/**
 * Initialize all connectors with configuration
 * @param {Object} config - Configuration for all connectors
 */
async function initializeConnectors(config = {}) {
  const connectors = [];

  // Message Bus (required first)
  if (config.redpanda) {
    const redpanda = new RedpandaConnector(config.redpanda);
    await redpanda.connect();
    registry.register('redpanda', redpanda);
    connectors.push(redpanda);
  }

  // SIEM
  if (config.sentinel) {
    const sentinel = new SentinelConnector(config.sentinel);
    await sentinel.connect();
    registry.register('sentinel', sentinel);
    connectors.push(sentinel);
  }

  // SOAR
  if (config.cortexXSOAR) {
    const cortexXSOAR = new CortexXSOARConnector(config.cortexXSOAR);
    await cortexXSOAR.connect();
    registry.register('cortexXSOAR', cortexXSOAR);
    connectors.push(cortexXSOAR);
  }

  // IdP
  if (config.okta) {
    const okta = new OktaConnector(config.okta);
    await okta.connect();
    registry.register('okta', okta);
    connectors.push(keycloak);
  }

  // API Gateway
  if (config.kong) {
    const kong = new KongConnector(config.kong);
    await kong.connect();
    registry.register('kong', kong);
    connectors.push(kong);
  }

  // WAF/CDN
  if (config.cloudflare) {
    const cloudflare = new CloudflareConnector(config.cloudflare);
    await cloudflare.connect();
    registry.register('cloudflare', cloudflare);
    connectors.push(cloudflare);
  }

  // EDR
  if (config.crowdstrike) {
    const crowdstrike = new CrowdStrikeConnector(config.crowdstrike);
    await crowdstrike.connect();
    registry.register('crowdstrike', crowdstrike);
    connectors.push(crowdstrike);
  }

  // CSPM
  if (config.wiz) {
    const wiz = new WizConnector(config.wiz);
    await wiz.connect();
    registry.register('wiz', wiz);
    connectors.push(wiz);
  }

  // Threat Intel
  if (config.opencti) {
    const opencti = new OpenCTIConnector(config.opencti);
    await opencti.connect();
    registry.register('opencti', opencti);
    connectors.push(opencti);
  }

  // Network Sensors
  if (config.zeek) {
    const zeek = new ZeekConnector(config.zeek);
    await zeek.connect();
    registry.register('zeek', zeek);
    connectors.push(zeek);
  }

  if (config.suricata) {
    const suricata = new SuricataConnector(config.suricata);
    await suricata.connect();
    registry.register('suricata', suricata);
    connectors.push(suricata);
  }

  // Sandbox
  if (config.capesandbox) {
    const cape = new CapeSandboxConnector(config.capesandbox);
    await cape.connect();
    registry.register('capesandbox', cape);
    connectors.push(cape);
  }

  // Ticketing
  if (config.linear) {
    const linear = new LinearConnector(config.linear);
    await linear.connect();
    registry.register('linear', linear);
    connectors.push(linear);
  }

  // Communications
  if (config.slack) {
    const slack = new SlackConnector(config.slack);
    await slack.connect();
    registry.register('slack', slack);
    connectors.push(slack);
  }

  if (config.discord) {
    const discord = new DiscordConnector(config.discord);
    await discord.connect();
    registry.register('discord', discord);
    connectors.push(discord);
  }

  // Alerting
  if (config.incidentio) {
    const incidentio = new IncidentIOConnector(config.incidentio);
    await incidentio.connect();
    registry.register('incidentio', incidentio);
    connectors.push(incidentio);
  }

  // GRC
  if (config.vanta) {
    const vanta = new VantaConnector(config.vanta);
    await vanta.connect();
    registry.register('vanta', vanta);
    connectors.push(vanta);
  }

  // Secrets
  if (config.infisical) {
    const infisical = new InfisicalConnector(config.infisical);
    await infisical.connect();
    registry.register('infisical', infisical);
    connectors.push(infisical);
  }

  // Policy Engines
  if (config.opa) {
    const opa = new OPAConnector(config.opa);
    await opa.connect();
    registry.register('opa', opa);
    connectors.push(opa);
  }

  if (config.cedar) {
    const cedar = new CedarPolicyEngine(config.cedar);
    await cedar.connect();
    registry.register('cedar', cedar);
    connectors.push(cedar);
  }

  return connectors;
}

/**
 * Get a connector by name
 * @param {string} name - Connector name
 * @returns {BaseConnector} Connector instance
 */
function getConnector(name) {
  return registry.get(name);
}

/**
 * Gracefully shutdown all connectors
 */
async function shutdownConnectors() {
  await registry.disconnectAll();
}

module.exports = {
  // Base
  BaseConnector,
  ConnectorRegistry,
  EventSchema,
  SchemaRegistry,
  RetryStrategy,
  CircuitBreaker,

  // Message Bus
  RedpandaConnector,
  RedpandaProducer,
  RedpandaConsumer,

  // SIEM & SOAR
  ChronicleConnector,
  TinesConnector,

  // Identity
  KeycloakConnector,
  FIDO2Manager,
  CedarPolicyEngine,
  OPAConnector,

  // Network & Edge
  KongConnector,
  FastlyConnector,
  ZeekConnector,
  SuricataConnector,

  // Endpoint & Cloud
  SentinelOneConnector,
  WizConnector,
  CapeSandboxConnector,

  // Threat Intel
  OpenCTIConnector,

  // Collaboration
  LinearConnector,
  SlackConnector,
  DiscordConnector,
  IncidentIOConnector,

  // Compliance
  VantaConnector,
  InfisicalConnector,

  // Registry & Lifecycle
  registry,
  initializeConnectors,
  getConnector,
  shutdownConnectors,
};
