import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worker = readFileSync(new URL("../worker.ts", import.meta.url), "utf8");
const mcpClient = readFileSync(new URL("../mcp-client.js", import.meta.url), "utf8");

function section(startMarker, endMarker) {
  const start = worker.indexOf(startMarker);
  assert.notEqual(start, -1, "Missing section: " + startMarker);
  const end = worker.indexOf(endMarker, start);
  assert.notEqual(end, -1, "Missing section end: " + endMarker);
  return worker.slice(start, end);
}

assert.doesNotMatch(worker, /API_KEY:\s*["\x27]akhil-123["\x27]/, "The committed legacy API key must not return.");
assert.match(worker, /legacyKeyMatches = !!env2\.NEXUS_LEGACY_API_KEY && apiKey === env2\.NEXUS_LEGACY_API_KEY/, "Legacy API compatibility must be explicitly configured as a Worker secret.");
assert.match(worker, /function generatenewId\(\)\s*\{\s*return crypto\.randomUUID\(\);/, "OAuth state IDs should use a cryptographically secure UUID.");
assert.match(worker, /async verifyJWT\(token\)[\s\S]*?this\.auth\("GET", "user", null, token\)/, "JWT verification must be delegated to Supabase Auth, not token decoding.");
assert.match(worker, /Secret encryption failed; refusing to store plaintext/, "Secret encryption errors must not fall back to plaintext.");

const pluginTest = section('if (path === "/api/test/plugins")', 'if (pathname === "/test-execute")');
assert.match(pluginTest, /enhancedAuthenticate\(request,\s*env2\)/);
assert.match(pluginTest, /!testAuth\.authenticated\s*\|\|\s*!isAdmin\(testAuth\.userId\)/, "Plugin test route must be admin-only.");

const telegramTest = section('if (pathname === "/testplugin")', 'if (path === "/slack/events"');
assert.match(telegramTest, /enhancedAuthenticate\(request,\s*env2\)/);
assert.match(telegramTest, /!testAuth\.authenticated\s*\|\|\s*!isAdmin\(testAuth\.userId\)/, "Telegram test route must be admin-only.");

for (const name of ["handleFigmaOAuth", "handleDiscordOAuth", "handleCanvaOAuth", "handleGenericOAuthInit"]) {
  const start = worker.indexOf("async function " + name + "(");
  assert.notEqual(start, -1, "Missing OAuth initializer: " + name);
  const end = worker.indexOf("__name(", start);
  const body = worker.slice(start, end);
  assert.match(body, /enhancedAuthenticate\(request,\s*env2\)/, name + " must validate the caller");
  assert.match(body, /const userId = auth\.userId;/, name + " must derive identity from verified auth");
  assert.doesNotMatch(body, /url\.searchParams\.get\("userId"\)\s*\|\|\s*"test_user"/, name + " must not accept arbitrary OAuth identity");
}

const memory = section("var MemorySystem =", "async function initD1Tables");
assert.match(memory, /user_id=eq\."\s*\+\s*encodeURIComponent\(this\.userId\)/, "Conversation operations must include owner scope.");
assert.match(memory, /async deleteChatFromSupabase\(conversationId\)[\s\S]*?user_id=eq\./, "Conversation deletion must be scoped to the current user.");

const contextBuilder = section("async function buildContext(", "async function getSession(");
assert.match(contextBuilder, /smartContextWindow\(session\.messages,\s*Math\.min\(MAX_MSGS,\s*80\)\)/, "Context selection should preserve chronological ordering.");

const answerEngine = section("async function quantumResponse(", "__name(quantumResponse");
assert.match(answerEngine, /presentation,\s*\.\.\.config\.responseFormat/, "The response should expose backward-compatible presentation metadata.");
assert.match(answerEngine, /sources:\s*normalizedSources/, "Sources should be normalized before returning.");
assert.match(answerEngine, /config\.includeRelatedQuestions !== false/, "Relevant follow-up questions should be available by default.");

for (const exportedName of ["getMcpOAuthStart", "matchMcpFromMessage", "formatMcpForThinking"]) {
  assert.match(mcpClient, new RegExp("export (?:async )?function " + exportedName + "\\b"), "Missing MCP client export: " + exportedName);
}
assert.match(mcpClient, /export \{ MCP_GATEWAY_CONNECTORS, listMcpGatewayCatalog \}/, "MCP catalog exports must be present.");

console.log("NEXUS upgrade static checks passed.");
