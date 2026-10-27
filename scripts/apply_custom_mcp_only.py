#!/usr/bin/env python3
"""Add Claude-style custom MCP actions to already MCP-wired worker.ts"""
from pathlib import Path

IMPORT_EXPAND = """  listCustomMcps,
  addCustomMcp,
  setCustomMcpCredentials,
  deleteCustomMcp,
  getCustomMcpOAuthStart,
  listCustomMcpTools,
  callCustomMcpTool
} from \"./mcp-client.js\";"""

FULL_IMPORT = """
import {
  loadMcpToolsForUser,
  listMcpConnectors,
  callMcpTool,
  getMcpOAuthStart,
  listMcpTools,
  mcpToolsToGeminiDeclarations,
  mcpToolsToOpenAITools,
  parseMcpFunctionName,
  matchMcpFromMessage,
  formatMcpForThinking,
  buildMcpThinkingSteps,
  buildMcpAnswerPrompt,
  listMcpGatewayCatalog,
  MCP_GATEWAY_CONNECTORS,
  listCustomMcps,
  addCustomMcp,
  setCustomMcpCredentials,
  deleteCustomMcp,
  getCustomMcpOAuthStart,
  listCustomMcpTools,
  callCustomMcpTool
} from \"./mcp-client.js\";"""

API_BLOCK = r"""    case \"mcp_custom_list\": {
      const res = await listCustomMcps(env2, auth.userId);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });
    }
    case \"mcp_custom_add\": {
      const res = await addCustomMcp(env2, auth.userId, { url: body.url || body.mcpUrl, mcpUrl: body.mcpUrl || body.url, name: body.name, headers: body.headers });
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" }, status: res && res.success ? 200 : 400 });
    }
    case \"mcp_custom_credentials\": {
      const id = body.connectorId || body.id || body.connector;
      const creds = body.credentials || body.auth || { apiKey: body.apiKey, token: body.token, bearer: body.bearer, authorization: body.authorization, headers: body.headers, headerName: body.headerName, value: body.value };
      const res = await setCustomMcpCredentials(env2, auth.userId, id, creds);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" }, status: res && res.success ? 200 : 400 });
    }
    case \"mcp_custom_delete\": {
      const id = body.connectorId || body.id || body.connector;
      const res = await deleteCustomMcp(env2, auth.userId, id);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });
    }
    case \"mcp_custom_oauth_start\": {
      const id = body.connectorId || body.id || body.connector;
      const res = await getCustomMcpOAuthStart(env2, auth.userId, id);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" }, status: res && res.success ? 200 : 400 });
    }
    case \"mcp_custom_tools_list\": {
      const id = body.connectorId || body.id || body.connector;
      const res = await listCustomMcpTools(env2, auth.userId, id);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });
    }
    case \"mcp_custom_tools_call\": {
      const id = body.connectorId || body.id || body.connector;
      const name = body.name || body.tool;
      const args = body.arguments || body.params || {};
      const res = await callCustomMcpTool(env2, auth.userId, id, name, args);
      return new Response(JSON.stringify(res), { headers: { ...CORS_HEADERS, \"Content-Type\": \"application/json\" } });
    }
"""


def main():
    worker = Path("worker.ts")
    if not worker.exists():
        raise SystemExit("Run from Nexus root (worker.ts missing)")
    text = worker.read_text(encoding="utf-8")

    if "listCustomMcps" not in text:
        needle = '} from "./mcp-client.js";'
        oauth_end = '} from "./oauth-plugins.js";'
        if needle in text:
            text = text.replace(needle, IMPORT_EXPAND, 1)
            print("OK expand import")
        elif oauth_end in text:
            text = text.replace(oauth_end, oauth_end + FULL_IMPORT, 1)
            print("OK full mcp-client import")
        else:
            raise SystemExit("Could not find import inject point")
    else:
        print("SKIP import")

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
        raise SystemExit("no inject point for API cases")
    text = text[:ist] + API_BLOCK + text[ist:]
    worker.write_text(text, encoding="utf-8")
    print("OK custom MCP API cases")
    print("Next: npx wrangler deploy")


if __name__ == "__main__":
    main()
