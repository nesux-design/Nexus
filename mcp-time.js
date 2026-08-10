import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export class TimeMcpServer extends McpAgent {
  server = new McpServer({ name: "time", version: "1.0" });
    initialized = false;  // ← Add flag

      async init() {
          if (this.initialized) return;  // ← Early return if already initialized
              this.initialized = true;

                  this.server.tool(
                        "get_current_time",
                              { timezone: z.string().optional() },
                                    async ({ timezone }) => {
                                            const tz = timezone || "UTC";
                                                    const now = new Date().toLocaleString("en-US", { timeZone: tz });
                                                            return { content: [{ type: "text", text: `Current time in ${tz}: ${now}` }] };
                                                                  }
                                                                      );
                                                                        }
                                                                        }