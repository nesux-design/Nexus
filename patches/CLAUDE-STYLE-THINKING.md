# Claude-style plugin thinking (like Claude app Summary UI)

Repo already has:
- `oauth-apps.js` — all OAuth plugins + `buildClaudeStyleThinkingSteps`
- `connector-mcp-phases.js` — re-exports for worker import
- worker already wires getMcpStyleTools, match, executePluginNew

## Extra worker.ts (minimal) for thinking UI

1. Import extras:
```js
import {
  getMcpStyleTools,
  formatMcpStyleToolsForThinking,
  matchConnectorToolFromMessage,
  reauthPayload,
  runConnectorApiAction,
  buildClaudeStyleThinkingSteps,
  formatThinkingStepsAsText
} from "./connector-mcp-phases.js";
```

2. In plugin auto-execute block (after executePluginNew), build steps:
```js
const thinking_steps = buildClaudeStyleThinkingSteps({
  message,
  connectedTools: thinking.connected_tools || [],
  matched: matchedConnectorTool,
  pluginResult,
  intent: "execute_plugin"
});
```

3. Response JSON add:
```js
thinking: formatThinkingStepsAsText(thinking_steps),
thinking_steps,  // frontend Claude-like list
```

Frontend: map `thinking_steps` to UI list (title + detail) — same idea as Claude Summary panel in your video.

## Flow (Claude/Grok plugins)
User message → scan connected OAuth apps → match tool → scopes check → API call → reauth if 401 → show steps + result.
