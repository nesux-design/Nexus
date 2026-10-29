import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worker = readFileSync(new URL("../worker.ts", import.meta.url), "utf8");
const mcpClient = readFileSync(new URL("../mcp-client.js", import.meta.url), "utf8");
assert.match(
  mcpClient,
  /const h = \{\s*\.\.\.headers,[\s\S]*?"X-Nexus-User-Id": String\(userId\),\s*"X-Nexus-Signature": signature/,
  "Caller-supplied headers must not be able to override the signed MCP user identity or HMAC signature."
);
const packageJson = readFileSync(new URL("../package.json", import.meta.url), "utf8");

function section(startMarker, endMarker) {
  const start = worker.indexOf(startMarker);
  assert.notEqual(start, -1, "Missing section: " + startMarker);
  const end = worker.indexOf(endMarker, start);
  assert.notEqual(end, -1, "Missing section end: " + endMarker);
  return worker.slice(start, end);
}

assert.doesNotMatch(worker, /API_KEY:\s*["\x27]akhil-123["\x27]/, "The committed legacy API key must not return.");
assert.doesNotMatch(worker, /You operate at GPT-5\.5 level|100% production grade answers/, "Do not claim parity with a proprietary model or promise perfect accuracy.");
assert.doesNotMatch(worker, /Give 100% accurate|GPT-5\.5/, "Do not guarantee perfect accuracy or label the service as a proprietary model version.");
assert.doesNotMatch(packageJson, /GPT-5\.5|ChatGPT-level|Claude-level|100% accurate/i, "Package metadata must not imply equivalence to a proprietary model version.");
assert.match(worker, /Do not claim to be ChatGPT, Claude, or a specific proprietary model/, "Assistant identity and model capability claims must be grounded.");
assert.match(worker, /Do not turn ordinary factual questions about visual subjects/, "Visual factual questions must not trigger image generation unnecessarily.");
assert.match(worker, /legacyKeyMatches = !!env2\.NEXUS_LEGACY_API_KEY && apiKey === env2\.NEXUS_LEGACY_API_KEY/, "Legacy API compatibility must be explicitly configured as a Worker secret.");
assert.match(worker, /function generatenewId\(\)\s*\{\s*return crypto\.randomUUID\(\);/, "OAuth state IDs should use a cryptographically secure UUID.");
assert.match(worker, /async verifyJWT\(token\)[\s\S]*?this\.auth\("GET", "user", null, token\)/, "JWT verification must be delegated to Supabase Auth, not token decoding.");
assert.match(worker, /Secret encryption failed; refusing to store plaintext/, "Secret encryption errors must not fall back to plaintext.");
assert.match(worker, /ENCRYPTION_KEY must be configured as a high-entropy Cloudflare secret/, "Encryption must fail closed when the secret is missing.");
assert.doesNotMatch(worker, /nexus-fallback-key-PLEASE-set-ENCRYPTION_KEY-secret-in-env/, "Do not ship a known fallback encryption key.");
const wrangler = readFileSync(new URL("../wrangler.toml", import.meta.url), "utf8");
assert.match(wrangler, /tag = "v2"/, "Keep the already-deployed Durable Object migration tag.");
assert.doesNotMatch(wrangler, /deleted_classes\s*=\s*\["TimeMcpServer"\]/, "Do not re-apply a stale tombstone for a class absent from the migration history.");

const canvasRoute = section('if (path.startsWith("/canvas/"))', 'if (path === "/api/test/plugins")');
assert.match(canvasRoute, /"Content-Security-Policy":\s*"sandbox allow-scripts"/, "User-generated canvas HTML must be served from a sandboxed opaque origin.");
assert.match(canvasRoute, /"X-Content-Type-Options":\s*"nosniff"/, "Canvas responses must disable MIME sniffing.");
assert.match(canvasRoute, /"Referrer-Policy":\s*"no-referrer"/, "Canvas pages must not leak referrer URLs.");

const pluginTest = section('if (path === "/api/test/plugins")', 'if (pathname === "/test-execute")');
assert.match(pluginTest, /enhancedAuthenticate\(request,\s*env2\)/);
assert.match(pluginTest, /!testAuth\.authenticated\s*\|\|\s*!isAdmin\(testAuth\.userId\)/, "Plugin test route must be admin-only.");
assert.doesNotMatch(pluginTest, /jaiswalanushi8@gmail\.com/, "Plugin tests must not default to a hardcoded personal email.");
assert.match(pluginTest, /NEXUS_TEST_EMAIL_TO/, "Email side effects must use an explicit test destination.");

const telegramTest = section('if (pathname === "/testplugin")', 'if (path === "/slack/events"');
assert.match(telegramTest, /enhancedAuthenticate\(request,\s*env2\)/);
assert.match(telegramTest, /!testAuth\.authenticated\s*\|\|\s*!isAdmin\(testAuth\.userId\)/, "Telegram test route must be admin-only.");
assert.doesNotMatch(telegramTest, /\+919839524592/, "Telegram test must not contain a hardcoded phone number.");
assert.match(telegramTest, /NEXUS_TEST_TELEGRAM_PHONE/, "Telegram test must use an explicit test phone secret.");
assert.match(telegramTest, /userId:\s*testAuth\.userId/, "Telegram test execution must use the authenticated admin identity, not a shared test user.");
assert.doesNotMatch(telegramTest, /userId:\s*["\x27]test_user["\x27]/, "Telegram test must not use a shared test identity.");

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

const mcpResolver = section("async function metaThinking2026(", "async function sendPremiumAlert2026");
assert.match(mcpResolver, /mcpPack\.nameMap\?\.\[resolved\.mcpTool\]/, "MCP calls should resolve sanitized function names through the per-request catalog map.");
assert.match(mcpResolver, /connector:\s*exactMcpTarget\.connector[\s\S]*?tool:\s*exactMcpTarget\.tool/, "MCP calls must preserve exact connector and tool names, including underscores.");

const answerEngine = section("async function quantumResponse(", "__name(quantumResponse");
assert.match(answerEngine, /presentation,\s*\.\.\.config\.responseFormat/, "The response should expose backward-compatible presentation metadata.");
assert.match(answerEngine, /sources:\s*normalizedSources/, "Sources should be normalized before returning.");
assert.match(answerEngine, /config\.includeRelatedQuestions !== false/, "Relevant follow-up questions should be available by default.");


assert.match(worker, /function normalizeWebSources\(sources\)/, "Web sources must be normalized before they are returned.");
assert.match(worker, /webSources = normalizeWebSources\(searchResult\.sources\)/, "Citation numbering must use the normalized source list.");
assert.match(worker, /function buildPresentationHint\(/, "Presentation metadata should be generated consistently.");
assert.match(worker, /presentation: response\.presentation \|\| null/, "The chat API must pass presentation hints through to clients.");
assert.match(worker, /sources: response\.sources \|\| \[\]/, "The chat API must pass citations/sources through to clients.");
assert.match(worker, /relatedQuestions: response\.relatedQuestions \|\| \[\]/, "The chat API must pass contextual follow-ups through to clients.");
assert.match(worker, /presentation: buildPresentationHint\(fullResponse, sourceList/, "Streaming completion must include presentation metadata.");
assert.doesNotMatch(worker, /genuine internal reasoning|only the private reasoning that leads up to it/, "Private chain-of-thought prompts must not be used.");
assert.doesNotMatch(worker, /thinking = groqRawResult\.reasoning/, "Raw provider reasoning must not be returned to clients.");
const streamProgress = section("async function* quantumThinkingStream(", '__name(quantumThinkingStream, "quantumThinkingStream");');
assert.match(streamProgress, /Preparing your response/, "Streaming should show a user-facing progress status.");
assert.doesNotMatch(streamProgress, /callGeminiOrGroq|fetch\(/, "Streaming progress must not call a model to generate hidden reasoning.");

for (const exportedName of ["getMcpOAuthStart", "matchMcpFromMessage", "formatMcpForThinking"]) {
  assert.match(mcpClient, new RegExp("export (?:async )?function " + exportedName + "\\b"), "Missing MCP client export: " + exportedName);
}
assert.match(mcpClient, /export \{ MCP_GATEWAY_CONNECTORS, listMcpGatewayCatalog \}/, "MCP catalog exports must be present.");


const genericOAuthCallback = section("async function handleGenericOAuthCallback(", "__name(handleGenericOAuthCallback");
assert.match(genericOAuthCallback, /if \(!state\)/, "OAuth callback must reject missing state.");
assert.match(genericOAuthCallback, /const userId = typeof parsedState\?\.userId === "string" \? parsedState\.userId\.trim\(\) : ""/, "OAuth state must carry a non-empty string user ID.");
assert.doesNotMatch(genericOAuthCallback, /userId\s*=\s*"test_user"/, "Malformed OAuth state must never fall back to a shared test identity.");
assert.match(genericOAuthCallback, /storedProvider !== provider \|\| !userId/, "OAuth callback must validate provider and owner before exchanging tokens.");

assert.doesNotMatch(worker, /accessToken\.substring\(0,\s*20\)/, "Integration access-token prefixes must not be written to logs.");
assert.doesNotMatch(worker, /result\.access_token\.substring\(0,\s*20\)/, "Stored access-token prefixes must not be written to logs.");
const pluginExecution = section("async function executePluginNew(", "__name(executePluginNew");
assert.doesNotMatch(pluginExecution, /console\.log\([^\n]*(?:JSON\.stringify\(body\)|params\.phone|params\.otp|JSON\.stringify\(result\))/, "Plugin request payloads, phone numbers, OTPs, and session-bearing results must not be logged.");


const standardOAuthCallback = section("async function handleStandardOAuthCallback(", "__name(handleStandardOAuthCallback");
assert.match(standardOAuthCallback, /if \(!state\)/, "Standard OAuth callbacks must reject missing state.");
assert.match(standardOAuthCallback, /storedProvider !== provider \|\| !userId/, "Standard OAuth callbacks must bind the state to a provider and authenticated owner.");
assert.doesNotMatch(standardOAuthCallback, /X-User-ID|test_user/, "Standard OAuth callbacks must not trust caller headers or shared fallback identities.");
assert.match(standardOAuthCallback, /await env2\.KV\.delete\("oauth_state:" \+ state\)/, "OAuth state must be consumed after validation.");

const canvaOAuthCallback = section("async function handleCanvaOAuthCallback(", "__name(handleCanvaOAuthCallback");
assert.match(canvaOAuthCallback, /parsedState\?\.provider !== "canva" \|\| !userId/, "Canva callback must validate provider and owner.");
assert.doesNotMatch(canvaOAuthCallback, /X-User-ID|test_user|url\.toString\(\)|code=\$\{code\}|state=\$\{state\}/, "Canva callback must not use fallback identities or log authorization URL/code/state.");
assert.match(canvaOAuthCallback, /await env2\.KV\.delete\("oauth_state:" \+ state\)/, "Canva OAuth state must be consumed after validation.");
assert.match(genericOAuthCallback, /await env2\.KV\.delete\("oauth_code_verifier:" \+ state\)/, "Generic OAuth PKCE verifier must be consumed after lookup.");

assert.match(genericOAuthCallback, /const integrationStored = await storeIntegration[\s\S]*?if \(!integrationStored\?\.success\)/, "Generic OAuth must not report success when secure token storage fails.");
assert.match(standardOAuthCallback, /const integrationStored = await storeIntegration[\s\S]*?if \(!integrationStored\?\.success\)/, "Standard OAuth must not report success when secure token storage fails.");
assert.match(canvaOAuthCallback, /const integrationStored = await storeIntegration[\s\S]*?if \(!integrationStored\?\.success\)/, "Canva OAuth must not report success when secure token storage fails.");


const storeIntegrationSection = section("async function storeIntegration(", "__name(storeIntegration");
assert.match(storeIntegrationSection, /tokenData\.access_token \? await encryptSecret\(env2, tokenData\.access_token\)/, "New integration access tokens must be encrypted before storage.");
assert.match(storeIntegrationSection, /tokenData\.refresh_token \? await encryptSecret\(env2, tokenData\.refresh_token\)/, "New integration refresh tokens must be encrypted before storage.");
const refreshTokenSection = section("async function refreshOAuthToken(", "__name(refreshOAuthToken");
assert.match(refreshTokenSection, /encryptSecret\(env2, data\.access_token\)/, "Refreshed access tokens must be encrypted before persistence.");
const integrationReadSection = section("async function getIntegration(", "__name(getIntegration");
assert.match(integrationReadSection, /result\.access_token = storedAccessToken \? await decryptSecret\(env2, storedAccessToken\)/, "Integration access tokens must be decrypted before API use.");
assert.match(integrationReadSection, /needsTokenMigration/, "Legacy plaintext tokens should be eligible for best-effort migration when a valid key exists.");
const fullPluginSection = section("async function executePluginFull(", "__name(executePluginFull");
assert.match(fullPluginSection, /const accessToken = await decryptSecret\(env2, integration\.access_token\)/, "Direct plugin execution must decrypt stored tokens.");
const providerExecution = fullPluginSection.slice(fullPluginSection.indexOf("  let result;"));
assert.doesNotMatch(providerExecution, /integration\.access_token/, "Provider calls must use the decrypted token, never the stored database value.");

const legacyIntegrationConnect = section('case "integration_connect":', 'case "integration_disconnect":');
assert.match(legacyIntegrationConnect, /const oauthConfig = OAUTH_CONFIG\[app\]/, "Legacy integration connect must validate provider configuration.");
assert.match(legacyIntegrationConnect, /JSON\.stringify\(\{\s*provider:\s*app,\s*userId:\s*auth\.userId\s*\}\)/, "Legacy integration connect must store the provider and authenticated owner in OAuth state, matching callback validation.");
assert.ok(
  legacyIntegrationConnect.indexOf("const oauthConfig = OAUTH_CONFIG[app]") <
    legacyIntegrationConnect.indexOf('await env2.KV.put("oauth_state:" + oauthState'),
  "Unsupported providers must be rejected before an OAuth state record is created."
);
assert.match(legacyIntegrationConnect, /const tokenStored = await storeIntegration\(env2, auth\.userId, app, \{ access_token: token \}\)/, "Direct-token integration connect must inspect secure storage results.");
assert.match(legacyIntegrationConnect, /if \(!tokenStored\?\.success\)/, "Direct-token integration connect must not report success when persistence fails.");


assert.match(worker, /modelPreference: modelPreference === "auto" \? undefined : modelPreference/, "Validated chat model preference must reach the answer pipeline.");
assert.match(worker, /modelChain = \[preferredModel, \.\.\.modelChain\.filter/, "Selected provider must be tried first while preserving fallbacks.");
console.log("NEXUS upgrade static checks passed.");
