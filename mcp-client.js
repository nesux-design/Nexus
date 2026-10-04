/**
 * NEXUS A1 → nexus-mcp-server client (Claude / Grok style MCP)
 * Uses service binding NEXUS_MCP_SERVER when available, else MCP_SERVER_URL.
 * Auth: X-Nexus-User-Id + X-Nexus-Signature (HMAC-SHA256 of userId).
 */
const DEFAULT_MCP_URL = "https://nexus-mcp-server.apikeyakhilka.workers.dev";

function encoder() {
  return new TextEncoder();
}

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder().encode(value));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signNexusUser(userId, secret) {
  if (!userId || !secret) return null;
  return hmacHex(secret, String(userId));
}

function mcpBase(env) {
  return (env && env.MCP_SERVER_URL) || DEFAULT_MCP_URL;
}

export async function mcpGatewayFetch(env, userId, path, { method = "GET", body = null, headers = {} } = {}) {
  const secret = env?.NEXUS_INTERNAL_AUTH_SECRET;
  const signature = await signNexusUser(userId, secret);
  if (!userId || !signature) {
    return { ok: false, status: 401, error: "Missing NEXUS_INTERNAL_AUTH_SECRET or userId", data: null };
  }
  const h = {
    "X-Nexus-User-Id": String(userId),
    "X-Nexus-Signature": signature,
    Accept: "application/json, text/event-stream",
    ...headers
  };
  let payload = body;
  if (body != null && typeof body === "object" && !(body instanceof ArrayBuffer)) {
    h["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const pathClean = path.startsWith("/") ? path : `/${path}`;
  let res;
  try {
    if (env?.NEXUS_MCP_SERVER && typeof env.NEXUS_MCP_SERVER.fetch === "function") {
      res = await env.NEXUS_MCP_SERVER.fetch(`https://mcp-internal${pathClean}`, {
        method,
        headers: h,
        body: method === "GET" || method === "HEAD" ? undefined : payload
      });
    } else {
      res = await fetch(`${mcpBase(env)}${pathClean}`, {
        method,
        headers: h,
        body: method === "GET" || method === "HEAD" ? undefined : payload
      });
    }
  } catch (e) {
    return { ok: false, status: 0, error: e?.message || String(e), data: null };
  }
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return {
    ok: res.ok,
    status: res.status,
    error: res.ok ? null : data?.error || data?.message || `HTTP ${res.status}`,
    data,
    headers: Object.fromEntries(res.headers.entries()),
    wwwAuthenticate: res.headers.get("www-authenticate") || null
  };
}

export async function listMcpConnectors(env, userId) {
  const secret = env?.NEXUS_INTERNAL_AUTH_SECRET;
  if (secret && userId) {
    const r = await mcpGatewayFetch(env, userId, "/connectors", { method: "GET" });
    if (r.ok) return r.data?.connectors || r.data || [];
  }
  try {
    const res = await fetch(`${mcpBase(env)}/connectors`);
    const data = await res.json();
    return data?.connectors || [];
  } catch (e) {
    return [];
  }
}

export async function listMcpTools(env, userId, connector) {
  const rpc = {
    jsonrpc: "2.0",
    id: crypto.randomUUID(),
    method: "tools/list",
    params: {}
  };
  const r = await mcpGatewayFetch(env, userId, `/mcp/${encodeURIComponent(connector)}`, {
    method: "POST",
    body: rpc
  });
  if (!r.ok) {
    return {
      success: false,
      status: r.status,
      error: r.error,
      oauth_required: r.status === 401,
      wwwAuthenticate: r.wwwAuthenticate,
      tools: []
    };
  }
  const tools =
    r.data?.result?.tools ||
    r.data?.tools ||
    (Array.isArray(r.data?.result) ? r.data.result : []) ||
    [];
  return { success: true, tools: Array.isArray(tools) ? tools : [], data: r.data };
}

export async function callMcpTool(env, userId, connector, name, args = {}) {
  const rpc = {
    jsonrpc: "2.0",
    id: crypto.randomUUID(),
    method: "tools/call",
    params: { name, arguments: args && typeof args === "object" ? args : {} }
  };
  const r = await mcpGatewayFetch(env, userId, `/mcp/${encodeURIComponent(connector)}`, {
    method: "POST",
    body: rpc
  });
  if (!r.ok) {
    return {
      success: false,
      status: r.status,
      error: r.error,
      oauth_required: r.status === 401,
      wwwAuthenticate: r.wwwAuthenticate,
      data: r.data
    };
  }
  return { success: true, data: r.data?.result || r.data, raw: r.data };
}

export function mcpFunctionName(connector, toolName) {
  const c = String(connector || "").replace(/[^a-zA-Z0-9_]/g, "_");
  const t = String(toolName || "").replace(/[^a-zA-Z0-9_]/g, "_");
  return `mcp_${c}_${t}`.slice(0, 64);
}

export function parseMcpFunctionName(name) {
  const n = String(name || "");
  if (!n.startsWith("mcp_")) return null;
  const rest = n.slice(4);
  const i = rest.indexOf("_");
  if (i < 0) return null;
  return { connector: rest.slice(0, i), tool: rest.slice(i + 1).replace(/_/g, " ") };
}

export function mcpToolsToGeminiDeclarations(mcpTools) {
  const decls = [];
  const nameMap = {};
  for (const t of mcpTools || []) {
    if (!t?.name || !t?.connector) continue;
    const fn = mcpFunctionName(t.connector, t.name);
    nameMap[fn] = { connector: t.connector, tool: t.name };
    const schema = t.inputSchema || t.input_schema || { type: "object", properties: {} };
    decls.push({
      name: fn,
      description: `[MCP:${t.connector}] ${t.description || t.name}. Live tool from remote MCP server.`,
      parameters: schema.type ? schema : { type: "object", properties: schema.properties || {} }
    });
  }
  return { decls, nameMap };
}

export function mcpToolsToOpenAITools(mcpTools) {
  const { decls } = mcpToolsToGeminiDeclarations(mcpTools);
  return decls.map((d) => ({
    type: "function",
    function: { name: d.name, description: d.description, parameters: d.parameters }
  }));
}

export async function loadMcpToolsForUser(env, userId, { connectors = null, limit = 6 } = {}) {
  if (!env?.NEXUS_INTERNAL_AUTH_SECRET || !userId) {
    return { tools: [], nameMap: {}, connectors: [], notes: ["MCP secret or userId missing"] };
  }
  let list = connectors;
  if (!list || !list.length) {
    list = await listMcpConnectors(env, userId);
  }
  const ids = (list || [])
    .map((c) => (typeof c === "string" ? c : c.id))
    .filter(Boolean)
    .slice(0, limit);

  const tools = [];
  const notes = [];
  const priority = ["cloudflare", "github", "supabase", "vercel", "netlify", "airtable", "atlassian", "sentry"];
  ids.sort((a, b) => {
    const ia = priority.indexOf(a);
    const ib = priority.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  await Promise.all(
    ids.slice(0, limit).map(async (id) => {
      try {
        const res = await listMcpTools(env, userId, id);
        if (res.oauth_required) {
          notes.push(`${id}: authorization required`);
          return;
        }
        if (!res.success) {
          notes.push(`${id}: ${res.error || "failed"}`);
          return;
        }
        for (const tool of res.tools || []) {
          tools.push({
            connector: id,
            name: tool.name,
            description: tool.description || tool.name,
            inputSchema: tool.inputSchema || tool.input_schema
          });
        }
      } catch (e) {
        notes.push(`${id}: ${e?.message || e}`);
      }
    })
  );

  const { decls, nameMap } = mcpToolsToGeminiDeclarations(tools);
  return { tools, decls, nameMap, connectors: ids, notes };
}

export function buildMcpThinkingSteps({ message, connector, tool, result }) {
  const steps = [];
  if (message) steps.push({ title: "Understanding request", detail: String(message).slice(0, 120), status: "done" });
  steps.push({ title: "MCP gateway", detail: "nexus-mcp-server", status: "done" });
  if (connector) steps.push({ title: "Connector", detail: connector, status: "done" });
  if (tool) steps.push({ title: "MCP tool", detail: tool, status: "done" });
  if (result) {
    if (result.oauth_required) {
      steps.push({ title: "Needs OAuth", detail: "Provider consent required", status: "blocked" });
    } else if (result.success === false) {
      steps.push({ title: "MCP call failed", detail: String(result.error || "").slice(0, 100), status: "error" });
    } else {
      steps.push({ title: "Got MCP result", detail: "tools/call ok", status: "done" });
      steps.push({ title: "Writing answer", detail: "From MCP data", status: "done" });
    }
  }
  return steps;
}

export function buildMcpAnswerPrompt(userMessage, connector, tool, data) {
  const payload = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return `You are NEXUS, connected to real MCP servers (Claude/Grok style).

User asked: "${userMessage}"

MCP connector: ${connector}
Tool: ${tool}

Live MCP result:
\`\`\`json
${String(payload).substring(0, 12000)}
\`\`\`

Answer clearly in the user's language. No raw JSON dump. If OAuth is required, tell them to connect that MCP provider.`;
}
