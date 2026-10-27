#!/usr/bin/env python3
"""Wire Claude-style custom MCP API into worker.ts using mcpGatewayFetch only."""
from pathlib import Path

API_BLOCK = r"""    case \"mcp_custom_list\": {
      let res;
      if (typeof listCustomMcps === \"function\") {
        res = await listCustomMcps(env2, auth.userId);
      } else if (typeof mcpGatewayFetch === \"function\") {
        const r = await mcpGatewayFetch(env2, auth.userId, \"/custom-mcp\", { method: \"GET\" });
        res = r.ok ? { success: true, connectors: (r.data && r.data.connectors) || [] } : { success: false, error: r.error || \"list failed\", connectors: [] };
      } else {
        res = { success: false, error: \"MCP client not loaded\", connectors: [] };
      }
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });
    }
    case \"mcp_custom_add\": {
      let res;
      const payload = { url: body.url || body.mcpUrl, name: body.name || \"Custom MCP\", headers: body.headers };
      if (typeof addCustomMcp === \"function\") {
        res = await addCustomMcp(env2, auth.userId, payload);
      } else if (typeof mcpGatewayFetch === \"function\") {
        const r = await mcpGatewayFetch(env2, auth.userId, \"/custom-mcp\", { method: \"POST\", body: payload });
        res = r.ok ? { success: true, ...(r.data || {}) } : { success: false, error: r.error || (r.data && r.data.message) || \"add failed\", data: r.data };
      } else {
        res = { success: false, error: \"MCP client not loaded\" };
      }
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" }, status: res && res.success ? 200 : 400 });
    }
    case \"mcp_custom_credentials\": {
      const id = body.connectorId || body.id || body.connector;
      let res;
      if (typeof setCustomMcpCredentials === \"function\") {
        const creds = body.credentials || body.auth || { apiKey: body.apiKey, token: body.token, bearer: body.bearer, authorization: body.authorization, headers: body.headers };
        res = await setCustomMcpCredentials(env2, auth.userId, id, creds);
      } else if (typeof mcpGatewayFetch === \"function\") {
        const authBody = body.auth || body.credentials || {};
        if (body.apiKey) authBody.apiKey = body.apiKey;
        if (body.bearer || body.token) authBody.bearer = body.bearer || body.token;
        const r = await mcpGatewayFetch(env2, auth.userId, \"/custom-mcp/\" + encodeURIComponent(id) + \"/credentials\", { method: \"POST\", body: { auth: authBody } });
        res = r.ok ? { success: true, connectorId: id, ...(r.data || {}) } : { success: false, error: r.error || \"credentials failed\", data: r.data };
      } else {
        res = { success: false, error: \"MCP client not loaded\" };
      }
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" }, status: res && res.success ? 200 : 400 });
    }
    case \"mcp_custom_delete\": {
      const id = body.connectorId || body.id || body.connector;
      let res;
      if (typeof deleteCustomMcp === \"function\") {
        res = await deleteCustomMcp(env2, auth.userId, id);
      } else if (typeof mcpGatewayFetch === \"function\") {
        const r = await mcpGatewayFetch(env2, auth.userId, \"/custom-mcp/\" + encodeURIComponent(id), { method: \"DELETE\" });
        res = r.ok ? { success: true, deleted: id, ...(r.data || {}) } : { success: false, error: r.error || \"delete failed\" };
      } else {
        res = { success: false, error: \"MCP client not loaded\" };
      }
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });
    }
    case \"mcp_custom_oauth_start\": {
      const id = body.connectorId || body.id || body.connector;
      let res;
      if (typeof getCustomMcpOAuthStart === \"function\") {
        res = await getCustomMcpOAuthStart(env2, auth.userId, id);
      } else if (typeof mcpGatewayFetch === \"function\") {
        const r = await mcpGatewayFetch(env2, auth.userId, \"/oauth/custom/\" + encodeURIComponent(id) + \"/start\", { method: \"GET\" });
        const loc = r.location || (r.data && (r.data.authorize_url || r.data.url));
        res = loc ? { success: true, connector: id, authorize_url: loc } : { success: false, error: r.error || \"oauth_start_failed\", data: r.data };
      } else {
        res = { success: false, error: \"MCP client not loaded\" };
      }
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" }, status: res && res.success ? 200 : 400 });
    }
    case \"mcp_custom_tools_list\": {
      const id = body.connectorId || body.id || body.connector;
      let res;
      if (typeof listCustomMcpTools === \"function\") {
        res = await listCustomMcpTools(env2, auth.userId, id);
      } else if (typeof listMcpTools === \"function\") {
        res = await listMcpTools(env2, auth.userId, \"custom/\" + id);
      } else if (typeof mcpGatewayFetch === \"function\") {
        const rpc = { jsonrpc: \"2.0\", id: crypto.randomUUID(), method: \"tools/list\", params: {} };
        const r = await mcpGatewayFetch(env2, auth.userId, \"/mcp/custom/\" + encodeURIComponent(id), { method: \"POST\", body: rpc });
        const tools = (r.data && r.data.result && r.data.result.tools) || (r.data && r.data.tools) || [];
        res = r.ok ? { success: true, tools } : { success: false, error: r.error, tools: [], oauth_required: r.status === 401 };
      } else {
        res = { success: false, error: \"MCP client not loaded\", tools: [] };
      }
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });
    }
    case \"mcp_custom_tools_call\": {
      const id = body.connectorId || body.id || body.connector;
      const name = body.name || body.tool;
      const args = body.arguments || body.params || {};
      let res;
      if (typeof callCustomMcpTool === \"function\") {
        res = await callCustomMcpTool(env2, auth.userId, id, name, args);
      } else if (typeof callMcpTool === \"function\") {
        res = await callMcpTool(env2, auth.userId, \"custom/\" + id, name, args);
      } else if (typeof mcpGatewayFetch === \"function\") {
        const rpc = { jsonrpc: \"2.0\", id: crypto.randomUUID(), method: \"tools/call\", params: { name, arguments: args } };
        const r = await mcpGatewayFetch(env2, auth.userId, \"/mcp/custom/\" + encodeURIComponent(id), { method: \"POST\", body: rpc });
        res = r.ok ? { success: true, data: (r.data && r.data.result) || r.data } : { success: false, error: r.error, data: r.data };
      } else {
        res = { success: false, error: \"MCP client not loaded\" };
      }
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });
    }
"""


def main():
    worker = Path("worker.ts")
    if not worker.exists():
        raise SystemExit("Run from Nexus root (worker.ts missing)")
    text = worker.read_text(encoding="utf-8")

    if 'from "./mcp-client.js"' in text and "mcpGatewayFetch" not in text:
        needle = '} from "./mcp-client.js";'
        if needle in text:
            text = text.replace(
                needle,
                '  mcpGatewayFetch,\n  listMcpTools,\n  callMcpTool\n} from "./mcp-client.js";',
                1,
            )
            print("OK expand import mcpGatewayFetch")
    elif 'from "./mcp-client.js"' not in text and 'from "./oauth-plugins.js"' in text:
        imp = '''\nimport {\n  mcpGatewayFetch,\n  listMcpTools,\n  callMcpTool,\n  listMcpConnectors,\n  getMcpOAuthStart\n} from \"./mcp-client.js\";'''
        text = text.replace('} from "./oauth-plugins.js";', '} from "./oauth-plugins.js";' + imp, 1)
        print("OK add mcp-client import")
    else:
        print("SKIP import (check manually if needed)")

    if 'case "mcp_custom_add"' in text:
        print("Custom MCP actions already present")
        worker.write_text(text, encoding="utf-8")
        return

    ist = text.find('case "integration_status":')
    if ist < 0:
        ist = text.find('case "execute_plugin":')
    if ist < 0:
        ist = text.find('case "mcp_connectors":')
    if ist < 0:
        raise SystemExit("no inject point")
    text = text[:ist] + API_BLOCK + text[ist:]
    worker.write_text(text, encoding="utf-8")
    print("OK custom MCP API cases")
    print("Next: npx wrangler deploy")


if __name__ == "__main__":
    main()
