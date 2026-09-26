/**
 * Back-compat entry for worker.ts imports.
 * All OAuth plugin logic lives in oauth-apps.js
 */
export {
  CONNECTOR_TOOL_REGISTRY,
  getConnectorRegistryEntry,
  parseGrantedScopes,
  scopesAllow,
  getMcpStyleTools,
  formatMcpStyleToolsForThinking,
  buildClaudeStyleThinkingSteps,
  formatThinkingStepsAsText,
  matchConnectorToolFromMessage,
  reauthPayload,
  runConnectorApiAction
} from "./oauth-apps.js";
