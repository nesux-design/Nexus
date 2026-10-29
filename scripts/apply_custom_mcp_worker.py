#!/usr/bin/env python3
"""Wire custom MCP API into worker.ts and mcp-client.js (upgrade branch)."""
from pathlib import Path

CUSTOM_CLIENT = r'''

/** Claude-style custom MCP (user pastes remote MCP URL) */
export async function listCustomMcps(env, userId) {
  const r = await mcpGatewayFetch(env, userId, "/custom-mcp", { method: "GET" });
  if (!r.ok) return { success: false, error: r.error || "list failed", connectors: [], status: r.status };
  return { success: true, connectors: r.data?.connectors || [], data: r.data };
}

export async function addCustomMcp(env, userId, { url, mcpUrl, name, headers } = {}) {
  const u = String(mcpUrl || url || "").trim();
  if (!u) return { success: false, error: "url required" };
  const body = { url: u, name: name || "Custom MCP" };
  if (headers) body.headers = headers;
  const r = await mcpGatewayFetch(env, userId, "/custom-mcp", { method: "POST", body });
  if (!r.ok) return { success: false, error: r.error || r.data?.message || "add failed", data: r.data };
  return { success: true, ...(r.data || {}) };
}

export async function setCustomMcpCredentials(env, userId, connectorId, credentials = {}) {
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

export async function deleteCustomMcp(env, userId, connectorId) {
  const id = String(connectorId || "").trim();
  if (!id) return { success: false, error: "connectorId required" };
  const r = await mcpGatewayFetch(env, userId, `/custom-mcp/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!r.ok) return { success: false, error: r.error || "delete failed", status: r.status, data: r.data };
  return { success: true, deleted: id, ...(r.data || {}) };
}

export async function getCustomMcpOAuthStart(env, userId, connectorId) {
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
  return { success: false, connector: id, error: r.error || r.data?.message || "oauth_start_failed", status: r.status, data: r.data };
}

export async function listCustomMcpTools(env, userId, connectorId) {
  const id = String(connectorId || "").trim();
  if (!id) return { success: false, error: "connectorId required", tools: [] };
  return listMcpTools(env, userId, `custom/${id}`);
}

export async function callCustomMcpTool(env, userId, connectorId, name, args = {}) {
  const id = String(connectorId || "").trim();
  if (!id) return { success: false, error: "connectorId required" };
  return callMcpTool(env, userId, `custom/${id}`, name, args);
}
'''

CASES = r'''
    case "mcp_custom_list": {
      const res = await listCustomMcps(env2, auth.userId);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    case "mcp_custom_add": {
      const res = await addCustomMcp(env2, auth.userId, { url: body.url || body.mcpUrl, name: body.name, headers: body.headers });
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" }, status: res && res.success ? 200 : 400 });
    }
    case "mcp_custom_delete": {
      const id = body.connectorId || body.id || body.connector;
      const res = await deleteCustomMcp(env2, auth.userId, id);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    case "mcp_custom_oauth_start": {
      const id = body.connectorId || body.id || body.connector;
      const res = await getCustomMcpOAuthStart(env2, auth.userId, id);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" }, status: res && res.success ? 200 : 400 });
    }
    case "mcp_custom_tools_list": {
      const id = body.connectorId || body.id || body.connector;
      const res = await listCustomMcpTools(env2, auth.userId, id);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
    case "mcp_custom_tools_call": {
      const id = body.connectorId || body.id || body.connector;
      const name = body.name || body.tool;
      const args = body.arguments || body.params || {};
      const res = await callCustomMcpTool(env2, auth.userId, id, name, args);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
'''

def main():
    mc = Path("mcp-client.js")
    t = mc.read_text()
    if "listCustomMcps" not in t:
        mc.write_text(t.rstrip() + CUSTOM_CLIENT)
        print("mcp-client: custom helpers added")
    else:
        print("mcp-client: already has custom helpers")

    w = Path("worker.ts")
    wt = w.read_text()

    old_imp = '  MCP_GATEWAY_CONNECTORS\n} from "./mcp-client.js";'
    new_imp = '''  MCP_GATEWAY_CONNECTORS,
  listCustomMcps,
  addCustomMcp,
  deleteCustomMcp,
  getCustomMcpOAuthStart,
  listCustomMcpTools,
  callCustomMcpTool,
  setCustomMcpCredentials
} from "./mcp-client.js";'''
    if "listCustomMcps" not in wt:
        if old_imp not in wt:
            raise SystemExit("import needle missing")
        wt = wt.replace(old_imp, new_imp)
        print("worker: imports updated")
    else:
        print("worker: imports already")

    if '"mcp_connectors"' not in wt:
        old_aa = '"execute_plugin"\n        ]'
        new_aa = '''"execute_plugin",
          "mcp_connectors",
          "mcp_oauth_start",
          "mcp_tools_list",
          "mcp_tools_call",
          "mcp_custom_list",
          "mcp_custom_add",
          "mcp_custom_delete",
          "mcp_custom_oauth_start",
          "mcp_custom_tools_list",
          "mcp_custom_tools_call"
        ]'''
        if old_aa not in wt:
            raise SystemExit("availableActions needle missing")
        wt = wt.replace(old_aa, new_aa)
        print("worker: availableActions updated")
    else:
        print("worker: availableActions already has mcp")

    if "mcp_custom_list" not in wt:
        start = wt.find('case "mcp_tools_call"')
        if start < 0:
            raise SystemExit("mcp_tools_call missing")
        end = wt.find('case "integration_status"', start)
        if end < 0:
            raise SystemExit("integration_status missing")
        wt = wt[:end] + CASES + wt[end:]
        print("worker: custom MCP cases inserted")
    else:
        print("worker: custom MCP cases already present")

    w.write_text(wt)
    print("done", w.stat().st_size)

if __name__ == "__main__":
    main()
