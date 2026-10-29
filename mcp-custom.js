/**
 * Custom MCP helpers (Claude/Grok style: user pastes remote MCP URL).
 * Depends on mcpGatewayFetch / listMcpTools / callMcpTool from mcp-client.js —
 * imported by worker after re-export or used via dynamic import pattern.
 * This file is self-contained if mcpGatewayFetch is injected; for Worker,
 * prefer functions re-exported from mcp-client.js.
 */

export function createCustomMcpApi(mcpGatewayFetch, listMcpTools, callMcpTool) {
  async function listCustomMcps(env, userId) {
    const r = await mcpGatewayFetch(env, userId, "/custom-mcp", { method: "GET" });
    if (!r.ok) return { success: false, error: r.error || "list failed", connectors: [], status: r.status };
    return { success: true, connectors: r.data?.connectors || [], data: r.data };
  }

  async function addCustomMcp(env, userId, { url, mcpUrl, name, headers } = {}) {
    const u = String(mcpUrl || url || "").trim();
    if (!u) return { success: false, error: "url required" };
    const body = { url: u, name: name || "Custom MCP" };
    if (headers) body.headers = headers;
    const r = await mcpGatewayFetch(env, userId, "/custom-mcp", { method: "POST", body });
    if (!r.ok) return { success: false, error: r.error || r.data?.message || "add failed", data: r.data };
    return { success: true, ...(r.data || {}) };
  }

  async function setCustomMcpCredentials(env, userId, connectorId, credentials = {}) {
    const id = String(connectorId || "").trim();
    if (!id) return { success: false, error: "connectorId required" };
    const auth = credentials.auth && typeof credentials.auth === "object" ? { ...credentials.auth } : {};
    if (credentials.apiKey != null) auth.apiKey = credentials.apiKey;
    if (credentials.bearer != null) auth.bearer = credentials.bearer;
    if (credentials.token != null && auth.bearer == null) auth.bearer = credentials.token;
    const r = await mcpGatewayFetch(env, userId, `/custom-mcp/${encodeURIComponent(id)}/credentials`, {
      method: "POST",
      body: { auth }
    });
    if (!r.ok) return { success: false, error: r.error || "credentials failed", status: r.status, data: r.data };
    return { success: true, connectorId: id, hasCredentials: true, ...(r.data || {}) };
  }

  async function deleteCustomMcp(env, userId, connectorId) {
    const id = String(connectorId || "").trim();
    if (!id) return { success: false, error: "connectorId required" };
    const r = await mcpGatewayFetch(env, userId, `/custom-mcp/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!r.ok) return { success: false, error: r.error || "delete failed", status: r.status, data: r.data };
    return { success: true, deleted: id, ...(r.data || {}) };
  }

  async function getCustomMcpOAuthStart(env, userId, connectorId) {
    const id = String(connectorId || "").trim();
    if (!id) return { success: false, error: "connectorId required" };
    const r = await mcpGatewayFetch(env, userId, `/oauth/custom/${encodeURIComponent(id)}/start`, {
      method: "GET",
      redirect: "manual"
    });
    const location = r.location || r.headers?.location || r.data?.authorize_url || r.data?.url;
    if (location && /^https?:\/\//i.test(location)) {
      return { success: true, connector: id, authorize_url: location, status: r.status };
    }
    return {
      success: false,
      connector: id,
      error: r.error || r.data?.message || "oauth_start_failed",
      status: r.status,
      data: r.data
    };
  }

  async function listCustomMcpTools(env, userId, connectorId) {
    const id = String(connectorId || "").trim();
    if (!id) return { success: false, error: "connectorId required", tools: [] };
    return listMcpTools(env, userId, `custom/${id}`);
  }

  async function callCustomMcpTool(env, userId, connectorId, name, args = {}) {
    const id = String(connectorId || "").trim();
    if (!id) return { success: false, error: "connectorId required" };
    return callMcpTool(env, userId, `custom/${id}`, name, args);
  }

  return {
    listCustomMcps,
    addCustomMcp,
    setCustomMcpCredentials,
    deleteCustomMcp,
    getCustomMcpOAuthStart,
    listCustomMcpTools,
    callCustomMcpTool
  };
}
